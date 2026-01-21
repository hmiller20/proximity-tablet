'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function DebriefPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(true);

  const handleSubmit = () => {
    if (password.trim().toLowerCase() === 'prestige') {
      router.push('/experimenter');
    } else {
      setError('Wrong password');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 flex flex-col items-center gap-8">
            <p className="text-center text-lg sm:text-xl leading-relaxed">
              That concludes the study. Thanks for participating.
            </p>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-80 h-16 text-xl bg-[#ffeeb2] hover:bg-[#ffe699] text-black"
                  variant="secondary"
                >
                  View Debriefing Form Again
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>
                    That concludes the study. Thanks for participating. Please view the
                    debriefing form below. Then give the tablet back to the experimenter.
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                  <iframe
                    src="/debriefing-form.pdf"
                    className="w-full h-full min-h-[60vh]"
                    title="Debriefing Form"
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center gap-2">
              <Input
                placeholder="For experimenter only"
                type="text"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                onKeyDown={handleKeyDown}
                className="italic placeholder-gray-500 flex-1"
              />
              <Button onClick={handleSubmit}>Enter</Button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
