import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { HelpCircle, BookOpen, Target, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HELP_CONTENT } from './help-content';
import type { GeneratorType } from '@/lib/generators/types';

interface EducationalHelpProps {
  generatorType: GeneratorType;
}

export function EducationalHelp({ generatorType }: EducationalHelpProps) {
  const [open, setOpen] = useState(false);
  const content = HELP_CONTENT[generatorType];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6" title="Ayuda educativa">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5">
            {content.sections.map((section, i) => (
              <div key={i} className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span>{section.icon}</span>
                  {section.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                ¿Cuándo aplicarlo?
              </h4>
              <ul className="space-y-1.5">
                {content.whenToUse.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Interpretación de resultados
              </h4>
              <ul className="space-y-1.5">
                {content.interpretationTips.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
