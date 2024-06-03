import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "./components/ui/input";
import { useState } from "react";
import PizZip from "pizzip";

function str2xml(str: string) {
  if (str.charCodeAt(0) === 65279) {
    // BOM sequence
    str = str.substring(1);
  }
  return new DOMParser().parseFromString(str, "text/xml");
}

const parseValue = (value: string | null) => {
  switch (value) {
    case "☐":
      return false;
    case "☒":
      return true;

    default:
      return value;
  }
};

function getElements(content: any) {
  if (!content) {
    return [];
  }
  const zip = new PizZip(content);
  const xml = str2xml(zip.files["word/document.xml"].asText());

  const richs = xml.getElementsByTagName("w:sdt");
  const allRichs = [];

  for (let i = 0, len = richs.length; i < len; i++) {
    const rich = richs[i];
    const title = rich
      .getElementsByTagName("w:alias")[0]
      ?.getAttribute("w:val");
    const tag = rich.getElementsByTagName("w:tag")[0]?.getAttribute("w:val");
    const value = rich.getElementsByTagName("w:t")[0]?.childNodes[0].nodeValue;
    allRichs.push({ Titel: title, Tag: tag, Wert: parseValue(value) });
  }

  const countSubTags = allRichs.map((rich) =>
    rich.Tag ? rich.Tag.split("|").length - 1 : 0
  );

  const maxSubTags = Math.max(...countSubTags);

  const newRichs = allRichs.map((rich) => {
    const newRich = { ...rich } as any;

    const subTags = rich.Tag?.split("|");

    if (subTags) {
      newRich.Tag = subTags[0];
    }

    for (let i = 0; i < maxSubTags; i++) {
      newRich[`Tag ${i + 1}`] = subTags && subTags[i + 1] ? subTags[i + 1] : "";
    }

    return newRich;
  });

  return newRichs;
}

function Bieter({ setDataArray }: { setDataArray: any }) {

    const [open, setOpen] = useState(false);

  const [name, setName] = useState("");

  const [bieterData, setBieterData] = useState<any>(null);

  const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    let file = event.target.files?.[0]; // Add null check for event.target.files

    reader.onload = (e) => {
      const content = e.target?.result;
      const elements = getElements(content);
      setBieterData(elements);
    };

    reader.onerror = (err) => console.error(err);

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  };

  const onSubmit = () => {
    setDataArray((state: any[]) => [
      ...state,
      { name, data: bieterData },
    ]);
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size={"sm"}>
          <Plus className="size-6 mr-2" /> Teilnehmer hinzufügen
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Ausfüllen um Teilnehmer hinzuzufügen</DrawerTitle>
            <DrawerDescription>...</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Input className="" onChange={onFileUpload} type="file" />
            <Input
              placeholder="Name Teilnehmer"
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              disabled={name === "" || bieterData === null}
              onClick={() => onSubmit()}
            >
              Hinzufügen
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Abbrechen</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default Bieter;
