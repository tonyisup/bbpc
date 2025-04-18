'use client';

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { api } from "@/trpc/react";
import { useUploadThing } from "@/utils/uploadthing";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  initialName: string;
  initialImage?: string | null;
}

export function ProfileForm({ initialName, initialImage }: ProfileFormProps) {
  const [userName, setUserName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [image, setImage] = useState(initialImage);
  const [temporaryImage, setTemporaryImage] = useState<File | null>(null);
  const [temporaryImageUrl, setTemporaryImageUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        setImage(res[0].url);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    },
    onUploadError: (error) => {
      console.error("Error uploading image:", error);
    },
  });

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = async () => {
    if (temporaryImage) {
      await startUpload([temporaryImage]);
    }
    updateUser.mutate({ name: userName });
    setEditing(false);
  };

  // Clean up object URLs when component unmounts or when temporary image changes
  useEffect(() => {
    return () => {
      if (temporaryImageUrl) {
        URL.revokeObjectURL(temporaryImageUrl);
      }
    };
  }, [temporaryImageUrl]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 justify-between items-end">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex">
            <Avatar className="h-24 w-24">
              <AvatarImage src={temporaryImageUrl ?? image ?? ""} alt={userName} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-gray-800 p-2 hover:bg-gray-700">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEditing(true);
                    setTemporaryImage(file);
                    // Create a temporary URL for the file
                    const url = URL.createObjectURL(file);
                    setTemporaryImageUrl(url);
                  }
                }}
              />
              <Camera className="h-4 w-4" />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Display Name
          </label>
          <input
            id="name"
            type="text"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              setEditing(true);
            }}
            className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="flex flex-row gap-4 justify-center">
        {editing && <Button
          variant="destructive"
          onClick={() => {
            setUserName(initialName);
            setImage(initialImage);
            if (temporaryImageUrl) {
              URL.revokeObjectURL(temporaryImageUrl);
            }
            setTemporaryImage(null);
            setTemporaryImageUrl(null);
            setEditing(false);
          }}
          className="rounded-md px-4 py-2 font-medium transition disabled:opacity-50 outline outline-2 outline-gray-400 hover:outline-gray-300"
        >
          Cancel
        </Button>}
        {editing && <Button
          variant="outline"
          onClick={handleSave}
          disabled={updateUser.isLoading}
          className="rounded-md px-4 py-2 font-medium transition disabled:opacity-50 outline outline-2 outline-gray-400 hover:outline-gray-300"
        >
          {updateUser.isLoading ? "Saving..." : "Save Changes"}
        </Button>}

        {(saved || isUploading) && (
          <p className="text-center text-sm text-green-400">
            {isUploading ? "Uploading..." : "Profile updated successfully!"}
          </p>
        )}
      </div>
    </div>
  );
} 