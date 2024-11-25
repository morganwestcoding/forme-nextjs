import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
 reservationId?: string;
}

export async function PATCH(
 request: Request,
 { params }: { params: IParams }
) {
 const currentUser = await getCurrentUser();
 if (!currentUser) {
   return NextResponse.error();
 }

 const { reservationId } = params;
 if (!reservationId || typeof reservationId !== 'string') {
   throw new Error('Invalid ID');
 }

 try {
   const body = await request.json();
   const { action } = body; // 'accept' or 'decline'

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

   // Verify the current user is the listing owner
   if (reservation.listing.userId !== currentUser.id) {
     throw new Error('Unauthorized');
   }

   // Update the reservation status
   const updatedReservation = await prisma.reservation.update({
    where: {
      id: reservationId
    },
    data: {
      status: action === 'accept' ? 'accepted' : 'declined'
    },
    include: {  // Add this to include all related data
      listing: true,
      user: true
    }
  });

   // Create notification based on the action
   await prisma.notification.create({
     data: {
       type: action === 'accept' ? 'RESERVATION_ACCEPTED' : 'RESERVATION_DECLINED',
       content: action === 'accept'
         ? `Your reservation at ${reservation.listing.title} has been accepted`
         : `Your reservation at ${reservation.listing.title} has been declined`,
       userId: reservation.userId
     }
   });

   return NextResponse.json(updatedReservation);
 } catch (error) {
   console.error(`Error ${request.method} reservation:`, error);
   return new NextResponse(`Error updating reservation`, { status: 500 });
 }
}

export async function DELETE(
 request: Request, 
 { params }: { params: IParams }
) {
 const currentUser = await getCurrentUser();

 if (!currentUser) {
   return NextResponse.error();
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

   // Check if the current user is either the reservation owner or the listing owner
   const isReservationOwner = reservation.userId === currentUser.id;
   const isListingOwner = reservation.listing.userId === currentUser.id;

   if (!isReservationOwner && !isListingOwner) {
     throw new Error('Unauthorized');
   }

   // Delete the reservation
   await prisma.reservation.delete({
     where: {
       id: reservationId
     }
   });

   // Create appropriate notification based on who cancelled
   if (isListingOwner) {
     // Business owner cancelled the reservation
     await prisma.notification.create({
       data: {
         type: 'RESERVATION_CANCELLED_BY_BUSINESS',
         content: `Your reservation at ${reservation.listing.title} has been cancelled by the business`,
         userId: reservation.userId
       }
     });
   } else {
     // Customer cancelled their own reservation
     await prisma.notification.create({
       data: {
         type: 'RESERVATION_CANCELLED_BY_USER',
         content: `${reservation.user.name || 'Someone'} has cancelled their reservation for ${reservation.date.toLocaleDateString()}`,
         userId: reservation.listing.userId
       }
     });
   }

   return NextResponse.json({ message: "Reservation cancelled successfully" });
 } catch (error) {
   console.error("Error cancelling reservation:", error);
   return new NextResponse("Error cancelling reservation", { status: 500 });
 }
}