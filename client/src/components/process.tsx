export default function Process() {
  const steps = [
    {
      number: "1",
      title: "Choose a Service",
      description: "Begin by exploring our range of services and selecting the one that best fits your business needs."
    },
    {
      number: "2",
      title: "Request a Meeting",
      description: "Schedule a meeting with our team to understand your specific goals, challenges, and technology requirements."
    },
    {
      number: "3",
      title: "Receive Custom Plan",
      description: "We'll provide a personalized IT plan tailored to your business, outlining steps for optimization and success."
    },
    {
      number: "4",
      title: "Let's Make it Happen",
      description: "Our expert team implements the solution with ongoing support to ensure everything works seamlessly."
    }
  ];

  return (
    <section className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary-blue font-semibold text-lg">// Our Process</span>
          <h2 className="text-4xl font-bold text-professional-gray mb-6 mt-4">From Start to Finish</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our process is designed to deliver the best results with clarity and confidence, ensuring your technology works seamlessly.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary-blue w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
