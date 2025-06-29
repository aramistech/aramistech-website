import { Mail } from "lucide-react";

const teamMembers = [
  {
    name: "Aramis Figueroa",
    role: "IT NETWORK SPECIALIST",
    image: "/api/media/21/file",
    description: "With over 27 years of experience in the technology industry, Aramis specializes in network solutions, cloud services, and custom server setups. As the founder of AramisTech Corp, he's dedicated to helping businesses thrive in the digital landscape.",
    email: "aramis@aramistech.com"
  },
  {
    name: "Aramis M Figueroa",
    role: "IT / SOFTWARE DEVELOPER",
    image: "/api/media/16/file",
    description: "With 4 years of hands-on experience creating innovative solutions for businesses. Specializing in custom software development, web applications, and automation tools with a passion for coding and problem-solving.",
    email: "aramism@aramistech.com"
  },
  {
    name: "Gabriel Figueroa",
    role: "IT TECHNICIAN",
    image: "/api/media/16/file",
    description: "With over 2 years of experience in troubleshooting, maintaining, and optimizing IT systems. Known for his dedication to resolving technical issues quickly and efficiently with expertise in network maintenance and diagnostics.",
    email: "gabriel@aramistech.com"
  }
];

export default function Team() {
  return (
    <section id="team" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary-blue font-semibold text-lg">// AramisTech Team</span>
          <h2 className="text-4xl font-bold text-professional-gray mb-6 mt-4">Our Dedicated Team of Experts</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experienced tech professionals with a passion for problem-solving, dedicated to providing exceptional service and innovative solutions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <img 
                src={member.image} 
                alt={`${member.name} - ${member.role}`} 
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-primary-blue/20"
              />
              <h3 className="text-xl font-bold text-professional-gray mb-2">{member.name}</h3>
              <p className="text-primary-blue font-semibold mb-4">{member.role}</p>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {member.description}
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <a 
                  href={`mailto:${member.email}`}
                  className="flex items-center hover:text-primary-blue transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {member.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
