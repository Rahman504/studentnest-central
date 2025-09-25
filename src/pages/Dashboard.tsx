import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Upload, FileText, Video, Clock, CheckCircle, AlertCircle, Book } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  course_id: string;
  created_at: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  course_id: string;
  max_points: number;
}

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  content: string;
  file_url: string;
  grade: number;
  feedback: string;
  submitted_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate('/auth');
        } else {
          fetchData();
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      } else {
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      setCourses(coursesData || []);

      // Fetch user's notes
      const { data: notesData } = await supabase
        .from('notes')
        .select('*, courses(title)')
        .order('created_at', { ascending: false });
      setNotes(notesData || []);

      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*, courses(title)')
        .order('due_date', { ascending: true });
      setAssignments(assignmentsData || []);

      // Fetch user's submissions
      const { data: submissionsData } = await supabase
        .from('assignment_submissions')
        .select('*, assignments(title)')
        .order('submitted_at', { ascending: false });
      setSubmissions(submissionsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('notes')
        .insert([{
          student_id: user?.id,
          course_id: formData.get('courseId') as string,
          title: formData.get('title') as string,
          content: formData.get('content') as string,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note submitted successfully!",
      });
      
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting note:', error);
      toast({
        title: "Error",
        description: "Failed to submit note",
        variant: "destructive",
      });
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .upsert([{
          student_id: user?.id,
          assignment_id: formData.get('assignmentId') as string,
          content: formData.get('content') as string,
        }], { 
          onConflict: 'assignment_id,student_id' 
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment submitted successfully!",
      });
      
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Manage your courses, notes, and assignments</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Stats */}
          <div className="lg:col-span-3 grid md:grid-cols-4 gap-6 mb-8">
            {[
              { 
                title: "Enrolled Courses", 
                value: courses.length, 
                icon: Book, 
                color: "from-blue-500 to-cyan-500" 
              },
              { 
                title: "Notes Created", 
                value: notes.length, 
                icon: FileText, 
                color: "from-green-500 to-emerald-500" 
              },
              { 
                title: "Assignments Due", 
                value: assignments.filter(a => new Date(a.due_date) > new Date()).length, 
                icon: Clock, 
                color: "from-orange-500 to-red-500" 
              },
              { 
                title: "Completed", 
                value: submissions.length, 
                icon: CheckCircle, 
                color: "from-purple-500 to-pink-500" 
              },
            ].map((stat, index) => (
              <Card key={index} className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="courses" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="notes">My Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Available Courses</h2>
                </div>
                <div className="grid gap-4">
                  {courses.map((course) => (
                    <Card key={course.id} className="card-hover">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-primary" />
                          {course.title}
                        </CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          View Course Materials
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="assignments" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Assignments</h2>
                </div>
                <div className="grid gap-4">
                  {assignments.map((assignment) => {
                    const isOverdue = new Date(assignment.due_date) < new Date();
                    const hasSubmitted = submissions.some(s => s.assignment_id === assignment.id);
                    
                    return (
                      <Card key={assignment.id} className={`card-hover ${isOverdue && !hasSubmitted ? 'border-destructive/50' : ''}`}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                {assignment.title}
                              </CardTitle>
                              <CardDescription>{assignment.description}</CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={isOverdue ? "destructive" : hasSubmitted ? "default" : "secondary"}>
                                {hasSubmitted ? "Submitted" : isOverdue ? "Overdue" : "Pending"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Max Points: {assignment.max_points}
                            </span>
                            {!hasSubmitted && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button>Submit Assignment</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Submit Assignment: {assignment.title}</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={handleSubmitAssignment} className="space-y-4">
                                    <input type="hidden" name="assignmentId" value={assignment.id} />
                                    <div>
                                      <Label htmlFor="content">Your Submission</Label>
                                      <Textarea
                                        id="content"
                                        name="content"
                                        placeholder="Enter your assignment content here..."
                                        required
                                      />
                                    </div>
                                    <Button type="submit" className="w-full">
                                      Submit Assignment
                                    </Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">My Notes</h2>
                </div>
                <div className="grid gap-4">
                  {notes.map((note) => (
                    <Card key={note.id} className="card-hover">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          {note.title}
                        </CardTitle>
                        <CardDescription>
                          Created: {new Date(note.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {note.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Submit Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitNote} className="space-y-4">
                  <div>
                    <Label htmlFor="courseId">Course</Label>
                    <Select name="courseId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Note title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Write your notes here..."
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Submit Note
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">Assignment Submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      {submission.grade !== null && (
                        <Badge variant="default">
                          {submission.grade}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}