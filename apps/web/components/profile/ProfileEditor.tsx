"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Check } from "lucide-react";
import { useState, useRef } from "react";
import { useAppState } from "@/components/app/AppStateProvider";

export interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    bio: string;
    photos?: string[];
  };
}

export function ProfileEditor({ isOpen, onClose, initialData }: ProfileEditorProps) {
  const { updateUserProfile } = useAppState();
  const [bio, setBio] = useState(initialData.bio);
  const [photos, setPhotos] = useState<string[]>(initialData.photos || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a real app, you'd upload to a server. Here we'll just create a local URL.
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const saveProfile = () => {
    updateUserProfile({
      bio,
      image: photos.length > 0 ? photos[0] : undefined,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-4 z-[101] flex flex-col overflow-hidden rounded-3xl bg-card border border-primary/20 shadow-2xl md:inset-x-auto md:left-1/2 md:w-[500px] md:-translate-x-1/2 md:max-h-[80vh] md:top-[10vh]"
          >
            <div className="flex items-center justify-between border-b border-border/50 p-5">
              <h2 className="font-heading text-xl font-bold text-foreground">Edit Profile</h2>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary/50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section>
                <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Bio / Description
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your matches about yourself..."
                  className="w-full min-h-[120px] rounded-2xl border border-border bg-background/50 p-4 text-sm leading-relaxed text-foreground outline-none focus:border-primary transition-colors"
                />
              </section>

              <section>
                <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Photos
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-border">
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                      <button
                        onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="mt-2 text-[10px] font-medium text-muted-foreground">Add photo</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
              </section>
            </div>

            <div className="border-t border-border/50 p-5">
              <button
                onClick={saveProfile}
                className="gradient-emerald flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-heading font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
              >
                <Check className="h-5 w-5" /> Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
