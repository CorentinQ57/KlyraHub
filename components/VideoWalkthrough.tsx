'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, X, Maximize2, Volume2, VolumeX } from 'lucide-react';

interface VideoWalkthroughProps {
  videoSrc?: string
  videoTitle?: string
}

export default function VideoWalkthrough({ 
  videoSrc = 'https://www.youtube.com/embed/xxxxxxxx?autoplay=0&rel=0', 
  videoTitle = 'Guide d\'utilisation de Klyra Hub', 
}: VideoWalkthroughProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      {!isOpen ? (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-full shadow-lg bg-white p-3 cursor-pointer flex items-center"
          onClick={() => setIsOpen(true)}
        >
          <div className="bg-primary/10 rounded-full p-2 mr-3">
            <Play className="h-5 w-5 text-primary fill-current" />
          </div>
          <span className="text-sm font-medium pr-2">Vidéo explicative</span>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`shadow-xl rounded-lg overflow-hidden ${isExpanded ? 'fixed inset-4 z-[100]' : 'w-80'}`}
          >
            <Card className="overflow-hidden border-0">
              <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-3 px-4 flex justify-between items-center">
                <h3 className="font-medium text-sm">{videoTitle}</h3>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-white hover:bg-white/10 rounded-full"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? 
                      <VolumeX className="h-4 w-4" /> : 
                      <Volume2 className="h-4 w-4" />
                    }
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-white hover:bg-white/10 rounded-full"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-white hover:bg-white/10 rounded-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className={`aspect-video w-full ${isExpanded ? 'h-[calc(100vh-10rem)]' : ''}`}>
                <iframe
                  src={`${videoSrc}${isMuted ? '&mute=1' : ''}`}
                  title={videoTitle}
                  frameBorder="0"
                  allowFullScreen
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
} 