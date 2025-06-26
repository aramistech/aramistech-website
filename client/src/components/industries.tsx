import { Sprout, Stethoscope, Home, Scale, Plane, Grid3X3 } from "lucide-react";

const industries = [
  {
    icon: Sprout,
    title: "Agriculture",
    subtitle: "Cattle, Sod, Plant Nursery"
  },
  {
    icon: Stethoscope,
    title: "Medical",
    subtitle: "Healthcare Providers"
  },
  {
    icon: Home,
    title: "Real Estate",
    subtitle: "Survey, Title, Realtors"
  },
  {
    icon: Scale,
    title: "Law",
    subtitle: "Criminal, Divorce Attorneys"
  },
  {
    icon: Plane,
    title: "Aviation",
    subtitle: "Aircraft Parts"
  },
  {
    icon: Grid3X3,
    title: "Flooring",
    subtitle: "Tile & Flooring"
  }
];

export default function Industries() {
  return (
    <section id="industries" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary-blue font-semibold text-lg">// Our Customers</span>
          <h2 className="text-4xl font-bold text-professional-gray mb-6 mt-4">Serving Multiple Industries</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We proudly offer tailored tech solutions across a variety of industries, providing the technology support you can rely on.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {industries.map((industry, index) => {
            const IconComponent = industry.icon;
            return (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <IconComponent className="w-12 h-12 text-primary-blue mb-4 mx-auto" />
                <h3 className="font-semibold text-sm">{industry.title}</h3>
                <p className="text-xs text-gray-600 mt-2">{industry.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
