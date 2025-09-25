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
import { 
  Plus, 
  Video, 
  FileText, 
  Users, 
  BookOpen, 
  Settings, 
  Upload,
  Calendar,
  Award,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  course_id: string;
  courses?: { title: string };
}

interface Note {
  id: string;
  title: string;
  content: string;
  student_id: string;
  course_id: string;
  created_at: string;
  profiles?: { full_name: string };
  courses?: { title: string };
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  course_id: string;
  due_date: string;
  max_points: number;
}

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  grade: number;
  feedback: string;
  submitted_at: string;
  profiles?: { full_name: string };
  assignments?: { title: string };
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
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
          checkAdminAccess(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      } else {
        checkAdminAccess(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminAccess = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profileData || profileData.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      setProfile(profileData);
      fetchData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data for admin dashboard
      const [coursesRes, videosRes, notesRes, assignmentsRes, submissionsRes] = await Promise.all([
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('videos').select('*, courses(title)').order('created_at', { ascending: false }),
        supabase.from('notes').select('*, profiles(full_name), courses(title)').order('created_at', { ascending: false }),
        supabase.from('assignments').select('*, courses(title)').order('due_date', { ascending: true }),
        supabase.from('assignment_submissions').select('*, profiles(full_name), assignments(title)').order('submitted_at', { ascending: false })
      ]);

      setCourses(coursesRes.data || []);
      setVideos(videosRes.data || []);
      setNotes(notesRes.data || []);
      setAssignments(assignmentsRes.data || []);
      setSubmissions(submissionsRes.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('courses')
        .insert([{
          instructor_id: user?.id,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course created successfully!",
      });
      
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
    }
  };

  const handleUploadVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('videos')
        .insert([{
          course_id: formData.get('courseId') as string,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          video_url: formData.get('videoUrl') as string,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
      
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      });
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('assignments')
        .insert([{
          course_id: formData.get('courseId') as string,
          title: formData.get('title') as string,
          description: formData.get('description') as string,
          due_date: formData.get('dueDate') as string,
          max_points: parseInt(formData.get('maxPoints') as string),
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment created successfully!",
      });
      
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({
          grade,
          feedback,
          graded_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grade assigned successfully!",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error grading submission:', error);
      toast({
        title: "Error",
        description: "Failed to assign grade",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Manage courses, videos, and student submissions</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: "Total Courses", 
              value: courses.length, 
              icon: BookOpen, 
              color: "from-blue-500 to-cyan-500" 
            },
            { 
              title: "Videos Uploaded", 
              value: videos.length, 
              icon: Video, 
              color: "from-green-500 to-emerald-500" 
            },
            { 
              title: "Student Notes", 
              value: notes.length, 
              icon: FileText, 
              color: "from-orange-500 to-red-500" 
            },
            { 
              title: "Submissions", 
              value: submissions.length, 
              icon: TrendingUp, 
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

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="courses" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="notes">Student Notes</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Manage Courses</h2>
                </div>
                <div className="grid gap-4">
                  {courses.map((course) => (
                    <Card key={course.id} className="card-hover">
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="videos" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Course Videos</h2>
                </div>
                <div className="grid gap-4">
                  {videos.map((video) => (
                    <Card key={video.id} className="card-hover">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-primary" />
                          {video.title}
                        </CardTitle>
                        <CardDescription>{video.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Course: {video.courses?.title}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                              Watch
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Student Notes</h2>
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
                          By: {note.profiles?.full_name} • Course: {note.courses?.title}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Assignment Submissions</h2>
                </div>
                <div className="grid gap-4">
                  {submissions.map((submission) => (
                    <Card key={submission.id} className="card-hover">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              {submission.assignments?.title}
                            </CardTitle>
                            <CardDescription>
                              Student: {submission.profiles?.full_name}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {submission.grade !== null ? (
                              <Badge variant="default">
                                Grade: {submission.grade}%
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending Review</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {submission.content}
                        </p>
                        {submission.grade === null && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm">Grade Assignment</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Grade Assignment</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const grade = parseInt(formData.get('grade') as string);
                                const feedback = formData.get('feedback') as string;
                                handleGradeSubmission(submission.id, grade, feedback);
                              }} className="space-y-4">
                                <div>
                                  <Label htmlFor="grade">Grade (%)</Label>
                                  <Input
                                    id="grade"
                                    name="grade"
                                    type="number"
                                    min="0"
                                    max="100"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="feedback">Feedback</Label>
                                  <Textarea
                                    id="feedback"
                                    name="feedback"
                                    placeholder="Provide feedback to the student..."
                                  />
                                </div>
                                <Button type="submit" className="w-full">
                                  Assign Grade
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Course
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter course title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Course description"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Create Course
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadVideo} className="space-y-4">
                  <div>
                    <Label htmlFor="courseId">Course</Label>
                    <Select name="courseId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
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
                    <Label htmlFor="title">Video Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter video title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Video description"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      name="videoUrl"
                      type="url"
                      placeholder="https://..."
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Upload Video
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Create Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <Label htmlFor="courseId">Course</Label>
                    <Select name="courseId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
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
                    <Label htmlFor="title">Assignment Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter assignment title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Assignment description"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="datetime-local"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxPoints">Max Points</Label>
                    <Input
                      id="maxPoints"
                      name="maxPoints"
                      type="number"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Create Assignment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}