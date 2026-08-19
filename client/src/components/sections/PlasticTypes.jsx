import {
  Boxes,
  Coffee,
  CupSoda,
  Cylinder,
  Milk,
  PackageOpen,
  Recycle,
  ShoppingBag,
} from 'lucide-react'

const TYPES = [
  {
    name: 'PET',
    subtitle: 'Polyethylene Terephthalate',
    description:
      'Commonly used in water bottles, soft drink bottles, juice bottles and food containers.',
    examples: 'Water Bottle, Soft Drink Bottle, Oil Bottle',
    icon: CupSoda,
  },
  {
    name: 'HDPE',
    subtitle: 'High-Density Polyethylene',
    description:
      'Used in milk bottles, cleaning product bottles, buckets, crates and containers.',
    examples: 'Milk Bottle, Detergent Bottle, Bucket',
    icon: Milk,
  },
  {
    name: 'PVC',
    subtitle: 'Polyvinyl Chloride',
    description:
      'Used in pipes, fittings, wire insulation, and some packaging materials.',
    examples: 'Pipe, Cable Cover, Credit Card',
    icon: Cylinder,
  },
  {
    name: 'LDPE',
    subtitle: 'Low-Density Polyethylene',
    description:
      'Used in plastic bags, wraps, squeeze bottles and packaging films.',
    examples: 'Carry Bag, Shrink Wrap, Squeeze Bottle',
    icon: ShoppingBag,
  },
  {
    name: 'PP',
    subtitle: 'Polypropylene',
    description:
      'Used in food containers, bottle caps, straws, and packaging materials.',
    examples: 'Bottle Cap, Food Container, Straw',
    icon: Coffee,
  },
  {
    name: 'PS',
    subtitle: 'Polystyrene',
    description:
      'Used in disposable food containers, cups, plates and packaging materials.',
    examples: 'Thermocol Box, Cup, Disposable Plate',
    icon: Boxes,
  },
  {
    name: 'Other Plastics',
    subtitle: 'Other types of plastic',
    description:
      'Includes ABS, Nylon, Polycarbonate and other mixed or less common plastics.',
    examples: 'Toys, Electronic Parts, Mixed Plastic Items',
    icon: Recycle,
  },
  {
    name: 'Mixed Plastic',
    subtitle: 'Mixed or Multi-Layer Plastic',
    description:
      "Multi-layer packaging and mixed plastic items that don't fall into single categories.",
    examples: 'Chips Packet, Multi-Layer Packaging',
    icon: PackageOpen,
  },
]

export default function PlasticTypes() {
  return (
    <section className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-brand-700 sm:text-4xl">
          Plastic Types We Accept
        </h2>
        <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand-600" />
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TYPES.map(({ name, subtitle, description, examples, icon: Icon }) => (
          <div
            key={name}
            className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
              <Icon className="h-7 w-7 text-brand-700" strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{name}</h3>
            <p className="mt-1 text-sm font-medium text-brand-700">{subtitle}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
            <div className="mt-auto w-full">
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-xs leading-relaxed text-slate-600">
                  <span className="font-semibold text-slate-800">
                    Examples:{' '}
                  </span>
                  {examples}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
