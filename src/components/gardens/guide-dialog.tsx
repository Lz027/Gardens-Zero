import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const FAQ = [
  {
    q: "What is Gardens Zero?",
    a: "A calm desktop for your own work: floating notes, a dock of the links you use as apps, and four pillar folders that keep progress in view.",
  },
  {
    q: "How do notes work?",
    a: "Press New note on the desk. Drag the title bar to move a note, drag the bottom-right corner to resize, or use the expand button to fill the whole desk. Everything saves by itself. Minimise sends a note to the tray at the bottom of the desk.",
  },
  {
    q: "How do I organise notes?",
    a: "Create a desktop folder to group notes visually, and label a note with a pillar so it shows up in that pillar's page. A deleted note goes to the Trash Bin on the desk, where you can restore it or clear it for good.",
  },
  {
    q: "How does the app dock work?",
    a: "Add any link as an app with its own icon (images are resized to 256×256). Clicking an app opens it straight away. Drag one app onto another to merge them into a folder, and expand the dock to fit up to 16 apps.",
  },
  {
    q: "How do I delete or share apps?",
    a: "Use the pencil in the dock header to enter edit mode, tick the apps you want gone and press the trash icon. Right-click any app to reveal a link button that copies its link so you can share it any time.",
  },
  {
    q: "What are the pillars?",
    a: "Systems, Career, Projects and Academics sit in the taskbar at the bottom. Each one collects the notes you labelled with it plus a short progress log, so you can check where things stand at a glance.",
  },
  {
    q: "What lives on My Profile?",
    a: "Your name, headline, bio and links, plus your favourite apps and a small status: how many apps and notes you have made and which apps you share most.",
  },
];

export function GuideDialog({ trigger }: { trigger?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon-sm" aria-label="Guide and FAQ">
            <HelpCircle className="size-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>How Gardens Zero works</DialogTitle>
          <DialogDescription>
            A short guide to the desk, the dock and the pillars.
          </DialogDescription>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-sm">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
