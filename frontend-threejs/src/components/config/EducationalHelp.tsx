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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, BookOpen, Target, Lightbulb, PlayCircle, Rocket, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HELP_CONTENT } from './help-content';
import type { GeneratorType } from '@/lib/generators/types';
import { useGuidedTour } from '@/tour/useGuidedTour';
import { MathFormula } from './MathFormula';

interface EducationalHelpProps {
  generatorType: GeneratorType;
}

export function EducationalHelp({ generatorType }: EducationalHelpProps) {
  const [open, setOpen] = useState(false);
  const content = HELP_CONTENT[generatorType];
  const { startGeneratorTour } = useGuidedTour();

  const videoEmbedUrl = content.videoUrl.replace('watch?v=', 'embed/');

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
          <div className="space-y-5" data-tour="help-learning-tabs">
            <Tabs defaultValue="video" className="space-y-3">
              <TabsList className="w-full grid grid-cols-3 h-auto">
                <TabsTrigger value="video" className="text-xs sm:text-sm">Video</TabsTrigger>
                <TabsTrigger value="practica" className="text-xs sm:text-sm">Practica</TabsTrigger>
                <TabsTrigger value="resumen" className="text-xs sm:text-sm">Resumen</TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="mt-0">
                <div className="space-y-2">
                  <div className="overflow-hidden rounded-lg border bg-muted/20">
                    <div className="aspect-video w-full">
                      <iframe
                        className="h-full w-full"
                        src={videoEmbedUrl}
                        title={`Video educativo sobre ${content.title}`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  </div>
                  <a
                    href={content.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Ver video en YouTube <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </TabsContent>

              <TabsContent value="practica" className="mt-0 space-y-3">
                <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-primary" />
                    {content.tryItNow.title}
                  </h4>
                  <ol className="space-y-1.5">
                    {content.tryItNow.steps.map((step, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-medium mt-0.5">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <p className="text-xs text-muted-foreground rounded-md border bg-background p-2">
                    <span className="font-medium text-foreground">Que observar: </span>
                    {content.tryItNow.expected}
                  </p>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    startGeneratorTour();
                  }}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Iniciar mini tour de Generador
                </Button>
              </TabsContent>
              <TabsContent value="resumen" className="mt-0 space-y-5">
                {content.sections.map((section, i) => (
                  <div key={i} className="space-y-2 rounded-md border bg-muted/20 p-3">
                    <h4 className="font-semibold text-sm">{section.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                    {section.formulaTex && (
                      <div className="rounded-md border bg-background p-2">
                        <MathFormula tex={section.formulaTex} className="text-sm" />
                      </div>
                    )}
                  </div>
                ))}

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
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
