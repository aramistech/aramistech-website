import { Monitor, Server, Network, Mail, Cloud, Headphones, Check } from "lucide-react";

const services = [
  {
    icon: Monitor,
    title: "Workstation PC/Mac Maintenance",
    description: "Keep your workstations running at peak performance with our comprehensive maintenance services for both PC and Mac systems.",
    features: [
      "Performance optimization",
      "Software updates & patches",
      "Hardware diagnostics"
    ]
  },
  {
    icon: Server,
    title: "File Server Maintenance",
    description: "Ensure your business's file storage and sharing systems run smoothly, securely, and efficiently with our expert maintenance.",
    features: [
      "Data backup & recovery",
      "Security monitoring",
      "Performance optimization"
    ]
  },
  {
    icon: Network,
    title: "Active Directory Server Maintenance",
    description: "Keep your business's directory infrastructure secure, efficient, and fully optimized for seamless operations.",
    features: [
      "User management",
      "Security policies",
      "System monitoring"
    ]
  },
  {
    icon: Mail,
    title: "Exchange 365 & Google Workspace",
    description: "Comprehensive support for email, calendar, and collaboration tools to keep your business communication flowing.",
    features: [
      "Email configuration",
      "Migration services",
      "Security setup"
    ]
  },
  {
    icon: Cloud,
    title: "Synology NAS Maintenance",
    description: "Ensure your Network Attached Storage system operates smoothly with reliable data access and secure storage.",
    features: [
      "Data synchronization",
      "Remote access setup",
      "Backup configuration"
    ]
  },
  {
    icon: Headphones,
    title: "Hourly Phone Support",
    description: "Immediate access to expert technical assistance to keep your business running without disruptions.",
    features: [
      "Remote troubleshooting",
      "Quick issue resolution",
      "Technical guidance"
    ]
  }
];

export default function Services() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-professional-gray mb-6">Comprehensive IT Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From network maintenance to custom servers, we provide tailored IT solutions that keep your business running smoothly and efficiently.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="bg-primary-blue/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <IconComponent className="w-8 h-8 text-primary-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2 mb-6 text-sm">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={scrollToContact}
                  className="block w-full text-center bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-secondary-blue transition-colors"
                >
                  Learn More & Order
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
