import Image from "next/image";
import { auth0 } from "../lib/auth0";
import Login from "./components/login";
import MakeMeManagerButton from "./components/ManagerButton"
// Client Components
const NavigationBar = ({ isAuthenticated, userName }: { isAuthenticated: boolean; userName?: string }) => {
  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "1rem 2rem"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #EDA35A, #ff6b6b)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem"
          }}>
            🏥
          </div>
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0
          }}>
            CareShift
          </h2>
        </div>
        
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {isAuthenticated ? (
            <>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(102, 126, 234, 0.1)",
                padding: "0.5rem 1rem",
                borderRadius: "20px"
              }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}>
                  {userName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span style={{ color: "#667eea", fontWeight: "500" }}>
                  {userName}
                </span>
              </div>
              
              <a
                href="/auth/logout"
                style={{
                  color: "#ff6b6b",
                  textDecoration: "none",
                  fontWeight: "500",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  border: "1px solid #ff6b6b",
                  transition: "all 0.3s ease"
                }}
              >
                Sign Out
              </a>
            </>
          ) : (
            <>
              <a href="#features" style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "500",
                transition: "color 0.3s ease"
              }}>
                Features
              </a>
              <a href="#about" style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "500",
                transition: "color 0.3s ease"
              }}>
                About
              </a>
              <a
                href="/auth/login"
                style={{
                  background: "linear-gradient(135deg, #EDA35A, #ff6b6b)",
                  color: "#fff",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "25px",
                  textDecoration: "none",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  boxShadow: "0 4px 15px rgba(237, 163, 90, 0.3)"
                }}
              >
                Sign In
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const HeroSection = ({ isAuthenticated, userName }: { isAuthenticated: boolean; userName?: string }) => {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "2rem",
      paddingTop: "6rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Floating Elements Background */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "10%",
        width: "100px",
        height: "100px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        top: "20%",
        right: "15%",
        width: "60px",
        height: "60px",
        background: "rgba(237, 163, 90, 0.2)",
        borderRadius: "50%",
        animation: "float 4s ease-in-out infinite reverse"
      }} />
      <div style={{
        position: "absolute",
        bottom: "20%",
        left: "20%",
        width: "80px",
        height: "80px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        animation: "float 5s ease-in-out infinite"
      }} />

      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        padding: "3rem",
        maxWidth: "600px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        position: "relative",
        zIndex: 10
      }}>
        <div style={{
          fontSize: isAuthenticated ? "3rem" : "4rem",
          marginBottom: "1rem",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
        }}>
          {isAuthenticated ? "👋" : "🏥💼"}
        </div>
        
        <h1 style={{
          fontSize: isAuthenticated ? "2.5rem" : "3rem",
          fontWeight: "800",
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.2
        }}>
          {isAuthenticated ? `Welcome back, ${userName}!` : "Welcome to CareShift"}
        </h1>
        
        <p style={{
          marginBottom: "2rem",
          fontSize: isAuthenticated ? "1.1rem" : "1.2rem",
          color: "#555",
          lineHeight: 1.6,
          maxWidth: "500px",
          margin: "0 auto 2rem auto"
        }}>
          {isAuthenticated 
            ? "Ready to manage your shifts and track your team's performance? Access your personalized dashboard to get started."
            : "Streamline your healthcare workforce management with our intuitive platform. Track shifts, manage schedules, and optimize your care team's productivity."
          }
        </p>

        {isAuthenticated && <Login />}

        <div style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "2rem"
        }}>
          {isAuthenticated ? (
            <a
              href="/dashboard"
              style={{
                background: "linear-gradient(135deg, #EDA35A, #ff6b6b)",
                color: "#fff",
                padding: "1rem 2rem",
                borderRadius: "50px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "1.1rem",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 25px rgba(237, 163, 90, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              📊 Go to Dashboard
            </a>
            
          ) : (
            <>
              <a
                href="/auth/login"
                style={{
                  background: "linear-gradient(135deg, #EDA35A, #ff6b6b)",
                  color: "#fff",
                  padding: "1rem 2rem",
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 8px 25px rgba(237, 163, 90, 0.3)",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                🚀 Get Started
              </a>
              
             
            </>
          )}
        </div>

        <div style={{
          display: isAuthenticated ? "grid" : "flex",
          gridTemplateColumns: isAuthenticated ? "repeat(3, 1fr)" : "1fr",
          justifyContent: "center",
          gap: isAuthenticated ? "1rem" : "2rem",
          marginTop: "2rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(0,0,0,0.1)"
        }}>
          {isAuthenticated ? (
            <>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏰</div>
                <div style={{ fontSize: "0.9rem", color: "#777" }}>Track Shifts</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📊</div>
                <div style={{ fontSize: "0.9rem", color: "#777" }}>View Analytics</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>👥</div>
                <div style={{ fontSize: "0.9rem", color: "#777" }}>Manage Team</div>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>10K+</div>
                <div style={{ fontSize: "0.9rem", color: "#777" }}>Care Workers</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#4ecdc4" }}>500+</div>
                <div style={{ fontSize: "0.9rem", color: "#777" }}>Healthcare Facilities</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ff6b6b" }}>99.9%</div>
                <div style={{ fontSize: "0.9rem", color: "#777" }}>Uptime</div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: "⏰",
      title: "Smart Shift Management",
      description: "Effortlessly track clock-ins, clock-outs, and manage shift schedules with real-time updates.",
      color: "#667eea"
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Get detailed insights into workforce productivity, attendance patterns, and performance metrics.",
      color: "#4ecdc4"
    },
    {
      icon: "🏥",
      title: "Multi-Site Management",
      description: "Manage multiple healthcare facilities and worksites from a single, unified dashboard.",
      color: "#ff6b6b"
    },
    {
      icon: "👥",
      title: "Team Collaboration",
      description: "Enable seamless communication and coordination between managers and care workers.",
      color: "#96ceb4"
    },
    {
      icon: "📱",
      title: "Mobile Optimized",
      description: "Access all features on-the-go with our responsive, mobile-first design approach.",
      color: "#ffeaa7"
    },
    {
      icon: "🔒",
      title: "Secure & Compliant",
      description: "HIPAA-compliant security measures protect sensitive healthcare data and ensure privacy.",
      color: "#dda0dd"
    }
  ];

  return (
    <section id="features" style={{
      padding: "4rem 2rem",
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "3rem",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Powerful Features for Modern Healthcare
        </h2>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginTop: "3rem"
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              background: "white",
              padding: "2rem",
              borderRadius: "15px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer",
              border: `3px solid ${feature.color}20`
            }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: "1.3rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: feature.color
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: "#666",
                lineHeight: 1.6,
                fontSize: "1rem"
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer style={{
      background: "linear-gradient(135deg, #2d3748, #4a5568)",
      color: "white",
      padding: "3rem 2rem 2rem 2rem",
      textAlign: "center"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "2rem"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #EDA35A, #ff6b6b)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem"
          }}>
            🏥
          </div>
          <h3 style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "white",
            margin: 0
          }}>
            CareShift
          </h3>
        </div>
        
        <p style={{
          marginBottom: "2rem",
          color: "#cbd5e0",
          fontSize: "1rem",
          maxWidth: "500px",
          margin: "0 auto 2rem auto"
        }}>
          Empowering healthcare organizations with intelligent workforce management solutions.
        </p>
        
        <div style={{
          borderTop: "1px solid #4a5568",
          paddingTop: "2rem",
          color: "#a0aec0",
          fontSize: "0.9rem"
        }}>
          © 2025 CareShift. All rights reserved. | Built with ❤️ for healthcare heroes
        </div>
      </div>
    </footer>
  );
};

const GlobalStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @media (max-width: 768px) {
          nav {
            padding: 1rem !important;
          }
          
          nav > div {
            flex-direction: column;
            gap: 1rem;
          }
          
          main {
            padding-top: 8rem !important;
          }
          
          h1 {
            font-size: 2rem !important;
          }
        }
      `
    }} />
  );
};

const Home = async (): Promise<React.ReactNode> => {
  const session = await auth0.getSession();
  const isAuthenticated = !!session;
  const userName = session?.user?.name;
  
  console.log(session);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <NavigationBar isAuthenticated={isAuthenticated} userName={userName} />
      <HeroSection isAuthenticated={isAuthenticated} userName={userName} />
      {isAuthenticated && (
        <MakeMeManagerButton />
      )}
      {!isAuthenticated && (
        <>
          <FeaturesSection />
          <Footer />
        </>
      )}
      <GlobalStyles />
    </div>
  );
};

export default Home;
