import PizZip from "pizzip";
import { useRef, useState } from "react";
import { Input } from "./components/ui/input";
import * as XLSX from "xlsx";
import { Button } from "./components/ui/button";
import { Loader2 } from "lucide-react";

function str2xml(str: string) {
  if (str.charCodeAt(0) === 65279) {
    // BOM sequence
    str = str.substring(1);
  }
  return new DOMParser().parseFromString(str, "text/xml");
}

const exportData = (data: any[], bieter: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, bieter);

  XLSX.writeFile(
    workbook,
    `${new Date().toLocaleDateString("de-DE")}-${bieter}.xlsx`,
    { compression: true }
  );
};

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
    const title = rich.getElementsByTagName("w:alias")[0]?.getAttribute("w:val");
    const tag = rich.getElementsByTagName("w:tag")[0]?.getAttribute("w:val");
    const value = rich.getElementsByTagName("w:t")[0]?.childNodes[0].nodeValue;
    allRichs.push({ Titel: title, Tag: tag, Wert: parseValue(value) });
  }

  const countSubTags = allRichs.map((rich) => rich.Tag ?  rich.Tag.split("|").length - 1 : 0);

  const maxSubTags = Math.max(...countSubTags);

  const newRichs = allRichs.map((rich) => {

    const newRich = {...rich} as any;

    const subTags = rich.Tag?.split("|");

    if (subTags) {
      newRich.Tag = subTags[0];
    }

    for (let i = 0; i < maxSubTags; i++) {
      newRich[`Tag ${i + 1}`] = subTags && subTags[i + 1] ? subTags[i + 1] : "";
    }

    return newRich;

  })

  return newRichs;
}

function App() {
  const [data, setData] = useState<any>(null);
  const [bieter, setBieter] = useState<string>("");
  
  const formRef = useRef<HTMLFormElement>(null);

  const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    let file = event.target.files?.[0]; // Add null check for event.target.files

    reader.onload = (e) => {
      const content = e.target?.result;
      const elements = getElements(content);
      console.log(elements);
      setData(elements);
    };

    reader.onerror = (err) => console.error(err);

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <>
      <div className="w-full h-screen flex items-center justify-center">
        {data ? (
          <form ref={formRef} className="flex flex-col space-y-2">
            <Input
              onChange={(e) => setBieter(e.target.value)}
              placeholder="Bieter angeben"
            />
            <Button onClick={() => exportData(data, bieter)}>
              Exportieren
            </Button>
            <Button onClick={()=>formRef.current?.reset()} >
              <Loader2 className="size-4 mr-2" /> Reload
            </Button>
          </form>
        ) : (
          <div className="">
            <Input className="" onChange={onFileUpload} type="file" />
          </div>
        )}
      </div>
    </>
  );
}

export default App;
