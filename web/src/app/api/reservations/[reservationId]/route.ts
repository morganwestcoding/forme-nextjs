import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { canModifyResource, isMasterUser } from "@/app/libs/authorization";
import { getUserFromRequest } from "@/app/utils/mobileAuth";
import { apiError, apiErrorCode } from '@/app/utils/api';

interface IParams {
 reservationId?: string;
}

// POST — mobile status update (accepts { status: "confirmed" | "cancelled" })
export async function POST(
 request: Request,
 { params }: { params: IParams }
) {
 const currentUser = await getUserFromRequest(request) || await getCurrentUser();
 if (!currentUser) {
   return apiErrorCode('UNAUTHORIZED');
 }

 const { reservationId } = params;
 if (!reservationId) {
   return apiError("Invalid ID", 400);
 }

 try {
   const body = await request.json();
   const { status } = body;

   const reservation = await prisma.reservation.findUnique({
     where: { id: reservationId },
     include: { listing: { select: { title: true, userId: true } } },
   });

   if (!reservation) {
     return apiErrorCode('NOT_FOUND');
   }

   const updated = await prisma.reservation.update({
     where: { id: reservationId },
     data: { status },
   });

   // Notify the customer — skipped for guests (no account to notify in-app;
   // they're notified via email instead).
   if (reservation.userId) {
     const notifContent = status === 'confirmed'
       ? `Your reservation at ${reservation.listing.title} has been accepted`
       : `Your reservation at ${reservation.listing.title} has been declined`;

     await prisma.notification.create({
       data: {
         type: status === 'confirmed' ? 'RESERVATION_ACCEPTED' : 'RESERVATION_DECLINED',
         content: notifContent,
         userId: reservation.userId,
         relatedListingId: reservation.listingId,
       },
     });
   }

   return NextResponse.json(updated);
 } catch (error) {
   return apiError("Failed to update", 500);
 }
}

export async function PATCH(
 request: Request,
 { params }: { params: IParams }
) {
 const currentUser = await getUserFromRequest(request) || await getCurrentUser();
 if (!currentUser) {
   return apiErrorCode('UNAUTHORIZED');
 }

 const { reservationId } = params;
 if (!reservationId || typeof reservationId !== 'string') {
   throw new Error('Invalid ID');
 }

 try {
   const body = await request.json();
   const { action, newDate, newTime } = body; // action: 'accept' | 'decline' | 'reschedule'

   // First get the reservation details
   const reservation = await prisma.reservation.findUnique({
     where: {
       id: reservationId
     },
     include: {
       listing: {
         select: {
           title: true,
           userId: true
         }
       },
       employee: {
         select: {
           userId: true
         }
       },
       user: {
         select: {
           name: true
         }
       }
     }
   });

   if (!reservation) {
     throw new Error('Reservation not found');
   }

   // Verify the current user is the listing owner, the assigned employee, or master/admin
   const isAssignedEmployee = reservation.employee?.userId === currentUser.id;
   if (!canModifyResource(currentUser, reservation.listing.userId) && !isAssignedEmployee) {
     throw new Error('Unauthorized');
   }

   let updateData: Record<string, unknown> = {};
   let notificationType = '';
   let notificationContent = '';

   if (action === 'reschedule') {
     if (!newDate || !newTime) {
       return apiError('New date and time required for reschedule', 400);
     }
     updateData = { date: new Date(newDate), time: newTime, status: 'rescheduled' };
     notificationType = 'RESERVATION_RESCHEDULED';
     notificationContent = `Your reservation at ${reservation.listing.title} has been rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}`;
   } else {
     updateData = { status: action === 'accept' ? 'accepted' : 'declined' };
     notificationType = action === 'accept' ? 'RESERVATION_ACCEPTED' : 'RESERVATION_DECLINED';
     notificationContent = action === 'accept'
       ? `Your reservation at ${reservation.listing.title} has been accepted`
       : `Your reservation at ${reservation.listing.title} has been declined`;
   }

   const updatedReservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: updateData,
    include: {
      listing: true,
      user: true
    }
  });

   // Create notification — skipped for guest reservations (no account).
   if (reservation.userId) {
     await prisma.notification.create({
       data: {
         type: notificationType,
         content: notificationContent,
         userId: reservation.userId,
         relatedListingId: reservation.listingId
       }
     });
   }

   return NextResponse.json(updatedReservation);
 } catch (error) {
   return apiError('Error updating reservation', 500);
 }
}

export async function DELETE(
 request: Request,
 { params }: { params: IParams }
) {
 const currentUser = await getUserFromRequest(request) || await getCurrentUser();

 if (!currentUser) {
   return apiErrorCode('UNAUTHORIZED');
 }

 const { reservationId } = params;

 if (!reservationId || typeof reservationId !== 'string') {
   throw new Error('Invalid ID');
 }

 try {
   // First get the reservation details before deletion
   const reservation = await prisma.reservation.findUnique({
     where: {
       id: reservationId
     },
     include: {
       listing: {
         select: {
           title: true,
           userId: true
         }
       },
       employee: {
         select: {
           userId: true
         }
       },
       user: {
         select: {
           name: true
         }
       }
     }
   });

   if (!reservation) {
     throw new Error('Reservation not found');
   }

   // Check if the current user is either the reservation owner, listing owner, assigned employee, or master/admin
   const isReservationOwner = reservation.userId === currentUser.id;
   const isListingOwner = reservation.listing.userId === currentUser.id;
   const isAssignedEmployee = reservation.employee?.userId === currentUser.id;
   const isMaster = isMasterUser(currentUser);

   if (!isReservationOwner && !isListingOwner && !isAssignedEmployee && !isMaster) {
     throw new Error('Unauthorized');
   }

   // Delete the reservation
   await prisma.reservation.delete({
     where: {
       id: reservationId
     }
   });

   // Create appropriate notification based on who cancelled.
   // Guest reservations: no in-app notification when business cancels (no
   // account to deliver to — they'll be notified via email separately).
   if (isListingOwner || isAssignedEmployee || isMaster) {
     if (reservation.userId) {
       await prisma.notification.create({
         data: {
           type: 'RESERVATION_CANCELLED_BY_BUSINESS',
           content: `Your reservation at ${reservation.listing.title} has been cancelled by the business`,
           userId: reservation.userId,
           relatedListingId: reservation.listingId
         }
       });
     }
   } else {
     // Customer cancelled their own reservation. (Guests can't reach this
     // branch — they have no session — so reservation.user is non-null here.)
     const customerName = reservation.user?.name || reservation.guestName || 'Someone';
     await prisma.notification.create({
       data: {
         type: 'RESERVATION_CANCELLED_BY_USER',
         content: `${customerName} has cancelled their reservation for ${reservation.date.toLocaleDateString()}`,
         userId: reservation.listing.userId,
         relatedListingId: reservation.listingId
       }
     });
   }

   return NextResponse.json({ message: "Reservation cancelled successfully" });
 } catch (error) {
   return apiError("Error cancelling reservation", 500);
 }
}