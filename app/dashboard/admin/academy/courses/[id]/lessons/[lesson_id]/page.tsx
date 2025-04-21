const LessonForm = ({ courseId, lesson, moduleId }: LessonFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [duration, setDuration] = useState(lesson?.duration || '');
  const [type, setType] = useState<LessonType>(lesson?.type || 'video');
  const [content, setContent] = useState(lesson?.content || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '');
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const lessonData = {
        title,
        description,
        duration,
        type,
        content: type === 'text' ? content : null,
        video_url: type === 'video' ? videoUrl : null,
        module_id: moduleId,
      };
      
      let response;
      
      if (lesson) {
        // Update existing lesson
        response = await updateCourseLesson(lesson.id, lessonData);
      } else {
        // Create new lesson
        response = await createCourseLesson(lessonData);
      }
      
      if (response) {
        router.push(`/dashboard/admin/academy/courses/${courseId}`);
        toast({
          title: lesson ? "Leçon mise à jour" : "Leçon créée",
          description: lesson ? "La leçon a été mise à jour avec succès." : "La leçon a été créée avec succès.",
        });
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de la leçon.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Rest of the code for form fields
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la leçon"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la leçon"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="duration">Durée *</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ex: 10:30"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">Format: MM:SS</p>
          </div>
          
          <div>
            <Label htmlFor="type">Type de contenu *</Label>
            <Select
              value={type}
              onValueChange={(value: LessonType) => setType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="text">Texte</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          {type === 'video' && (
            <div>
              <Label htmlFor="videoUrl">URL de la vidéo</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>
          )}
          
          {type === 'text' && (
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenu de la leçon en texte..."
                rows={8}
              />
            </div>
          )}
          
          {type === 'quiz' && (
            <div className="p-4 border rounded-md bg-yellow-50 text-yellow-700">
              <p>La fonctionnalité de quiz sera disponible prochainement.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/admin/academy/courses/${courseId}`)}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {lesson ? 'Mettre à jour' : 'Créer'} la leçon
        </Button>
      </div>
    </form>
  );
}; 