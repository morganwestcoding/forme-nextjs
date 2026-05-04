'use client';

import { useState } from 'react';
import { PlusSignIcon, ArrowRight01Icon, Search01Icon, Cancel01Icon, FavouriteIcon } from 'hugeicons-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import Input from '@/components/ui/Input';

export default function KitchenSinkClient() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">
        <header>
          <h1 className="text-2xl font-semibold text-stone-900">UI Kitchen Sink</h1>
          <p className="text-[13px] text-stone-500 mt-1">Canonical primitives reference.</p>
        </header>

        <Card>
          <h2 className="text-[14px] font-semibold text-stone-900 mb-4">Button — variants</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-[14px] font-semibold text-stone-900 mb-4">Button — sizes</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-[14px] font-semibold text-stone-900 mb-4">Button — states & icons</h2>
          <div className="flex flex-wrap gap-3">
            <Button leftIcon={<PlusSignIcon size={16} />}>Create</Button>
            <Button rightIcon={<ArrowRight01Icon size={16} />}>Continue</Button>
            <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}>
              {loading ? 'Saving' : 'Click to load'}
            </Button>
            <Button disabled>Disabled</Button>
            <Button fullWidth>Full width</Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-[14px] font-semibold text-stone-900 mb-4">IconButton</h2>
          <div className="flex items-center gap-3">
            <IconButton aria-label="favorite" variant="ghost" icon={<FavouriteIcon size={16} />} />
            <IconButton aria-label="favorite" variant="outline" icon={<FavouriteIcon size={16} />} />
            <IconButton aria-label="favorite" variant="solid" icon={<FavouriteIcon size={16} />} />
            <span className="w-px h-6 bg-stone-200 mx-2" />
            <IconButton aria-label="close" size="sm" icon={<Cancel01Icon size={14} />} />
            <IconButton aria-label="close" size="md" icon={<Cancel01Icon size={16} />} />
            <IconButton aria-label="close" size="lg" icon={<Cancel01Icon size={18} />} />
          </div>
        </Card>

        <Card>
          <h2 className="text-[14px] font-semibold text-stone-900 mb-4">Input</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Input label="Email" type="email" placeholder="you@example.com" />
            <Input label="Search" leftIcon={<Search01Icon size={16} />} placeholder="Search…" />
            <Input label="Helper" helper="We'll never share your email." placeholder="Type here" />
            <Input label="Error" error="That doesn't look right" defaultValue="bad value" />
            <Input label="Disabled" disabled defaultValue="Locked" />
          </div>
        </Card>

        <div>
          <h2 className="text-[14px] font-semibold text-stone-900 mb-4">Card — padding scale</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card padding="sm"><span className="text-[12px] text-stone-500">padding=&quot;sm&quot; (p-4)</span></Card>
            <Card padding="md"><span className="text-[12px] text-stone-500">padding=&quot;md&quot; (p-5)</span></Card>
            <Card padding="lg"><span className="text-[12px] text-stone-500">padding=&quot;lg&quot; (p-6)</span></Card>
          </div>
          <div className="mt-4">
            <Card interactive>
              <span className="text-[12px] text-stone-500">interactive — hover me</span>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
