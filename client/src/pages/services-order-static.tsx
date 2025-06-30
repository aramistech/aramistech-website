import DynamicHeader from '@/components/dynamic-header';
import Footer from '@/components/footer';

export default function ServicesOrderStaticPage() {
  const handleOrderService = (serviceUrl: string) => {
    window.open(serviceUrl, '_blank');
  };

  const services = [
    {
      id: 1,
      name: "Workstation PC/Mac Maintenance Service",
      description: "Weekly Updates and unlimited support. Includes additional services. Ensure peak performance and minimize downtime with our proactive weekly maintenance service for Windows PCs and Apple Macs. We perform critical updates, security scans, disk health checks, and system optimizations to keep your workstations secure, fast, and reliable.",
      price: "$51/month",
      setupFee: null,
      icon: "workstation",
      url: "https://billing.aramistech.com/index.php?rp=/store/maintenance-services/workstation-pcmac-maintenance-service"
    },
    {
      id: 2,
      name: "File Server Maintenance Service", 
      description: "Weekly File Server updates with unlimited support. Our weekly file server maintenance ensures your server infrastructure remains stable, secure, and efficient. We conduct system diagnostics, monitor storage health, check backup status, apply necessary updates, and verify user access controls.",
      price: "$130/month",
      setupFee: null,
      icon: "server",
      url: "https://billing.aramistech.com/index.php?rp=/store/maintenance-services/file-server-maintenance-service"
    },
    {
      id: 3,
      name: "Exchange 365 or Google Workspace Support",
      description: "Managing Accounts - Add, remove accounts as needed, create Groups, or Distribution list. Technical Support - Contact Google or Microsoft to resolve any issues you are having, Check weekly logs or technical details to troubleshoot any issues with either the emails, spam, or configurations.",
      price: "$89/month", 
      setupFee: null,
      icon: "email",
      url: "https://billing.aramistech.com/index.php?rp=/store/maintenance-services/exchange-365-or-google-workspace-support"
    },
    {
      id: 4,
      name: "Active Directory Server Maintenance Service",
      description: "Weekly Active directory server maintenance and updates. Ensure the stability, security, and efficiency of your network with our comprehensive Active Directory maintenance service. We perform routine audits of user and group policies, remove stale or inactive accounts, validate domain controller replication.",
      price: "$180/month",
      setupFee: "$90 setup",
      icon: "directory",
      url: "https://billing.aramistech.com/index.php?rp=/store/maintenance-services/active-directory-server-maintenance-service"
    },
    {
      id: 5,
      name: "Synology NAS Maintenance Service",
      description: "A Synology NAS is a great alternative to a server. Our maintenance service keeps your NAS working smoothly all the time. Protect your data with our specialized Synology NAS maintenance service. We perform weekly checks on disk health, RAID integrity, system performance, firmware updates, and backup status.",
      price: "$115/month",
      setupFee: "$590 setup",
      icon: "nas",
      url: "https://billing.aramistech.com/index.php?rp=/store/maintenance-services/synology-nas-maintenance-service"
    },
    {
      id: 6,
      name: "Hourly Phone Support",
      description: "Need IT support without a maintenance plan? Our hourly phone support provides fast, expert assistance whenever you need it. Ideal for troubleshooting, tech questions, or one-time issues, this service offers flexible, reliable help on demand.",
      price: "$85/hour",
      setupFee: null,
      icon: "support",
      url: "https://billing.aramistech.com/index.php?rp=/store/maintenance-services/hourly-phone-support"
    }
  ];

  const getServiceIcon = (iconType: string) => {
    switch (iconType) {
      case 'workstation':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
        );
      case 'server':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        );
      case 'directory':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        );
      case 'nas':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v10h10V6H5z" clipRule="evenodd" />
          </svg>
        );
      case 'support':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DynamicHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-aramis-orange to-orange-500 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Professional IT Maintenance Services
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Protect your business with our comprehensive maintenance services. From servers to workstations, 
            we keep your technology running at peak performance with proactive monitoring and expert support.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {services.map((service) => (
            <div key={service.id} className="group relative">
              {/* Service Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      {getServiceIcon(service.icon)}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{service.price}</div>
                      {service.setupFee && (
                        <div className="text-sm opacity-90">{service.setupFee}</div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">
                    {service.name}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </div>
                  
                  <button
                    onClick={() => handleOrderService(service.url)}
                    className="w-full bg-gradient-to-r from-aramis-orange to-orange-500 text-white py-3 px-4 rounded-xl hover:from-orange-500 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group"
                  >
                    <span>Order Service</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our team can create tailored maintenance packages for your specific business needs. 
            Contact us for a free consultation and custom pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+13058144461" 
              className="bg-aramis-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Call (305) 814-4461
            </a>
            <a 
              href="mailto:sales@aramistech.com" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Email Sales Team
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}