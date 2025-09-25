import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Video, FileText, Award, Users, TrendingUp, Clock } from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 text-center z-10">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm">
              🎓 Transform Your Learning Journey
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold">
              Learn. Create.{" "}
              <span className="bg-gradient-to-r from-primary via-accent-foreground to-success bg-clip-text text-transparent animate-pulse-glow">
                Excel.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join our modern learning management system where students submit assignments and notes while 
              instructors create engaging video content.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary shadow-glow transition-all duration-300 px-8 py-6 text-lg"
                asChild
              >
                <Link to="/auth">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Start Learning Today
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary/20 hover:bg-primary/10 px-8 py-6 text-lg transition-all duration-300"
                asChild
              >
                <Link to="/courses">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive LMS platform provides all the tools needed for effective online learning and teaching.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Video,
                title: "Interactive Video Lessons",
                description: "High-quality video content with interactive elements and progress tracking.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: FileText,
                title: "Assignment Management", 
                description: "Submit, track, and receive feedback on assignments with integrated grading.",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: BookOpen,
                title: "Digital Note Taking",
                description: "Organize and share notes with classmates and instructors seamlessly.",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Users,
                title: "Collaborative Learning",
                description: "Connect with peers and instructors in a supportive learning environment.",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: Award,
                title: "Progress Tracking",
                description: "Monitor your learning progress with detailed analytics and achievements.",
                color: "from-teal-500 to-blue-500",
              },
              {
                icon: Clock,
                title: "Flexible Schedule",
                description: "Learn at your own pace with 24/7 access to course materials and resources.",
                color: "from-indigo-500 to-purple-500",
              },
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="card-hover border-border/50 bg-card/50 backdrop-blur-sm group"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "10,000+", label: "Active Students", icon: Users },
              { number: "500+", label: "Video Courses", icon: Video },
              { number: "50,000+", label: "Assignments Completed", icon: FileText },
              { number: "98%", label: "Success Rate", icon: TrendingUp },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-accent-foreground to-success relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of students and educators who are already using EduLMS to achieve their goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-xl px-8 py-6 text-lg transition-all duration-300"
                asChild
              >
                <Link to="/auth">
                  Get Started Free
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-6 text-lg"
                asChild
              >
                <Link to="/courses">
                  Explore Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
