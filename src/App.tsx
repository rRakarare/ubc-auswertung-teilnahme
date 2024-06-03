import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "./components/ui/button";
import Bieter from "./Bieter";
import { Save, Trash } from "lucide-react";
import { cn } from "./lib/utils";
import { Input } from "./components/ui/input";


const newArray = (data: any[]) => {
  let finalArray = [] as any[];

  data.forEach((d: any) => {
    const name = d.name;
    const bieterData = d.data

    finalArray.push(...bieterData.map((data: any) => ({teilnehmer: name, ...data})))


  });

  return finalArray;

}


const exportData = (data: any[], fileName: string) => {
  

  let finalArray = newArray(data);

  console.log({
    first: finalArray,
    second: data[0].data
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(finalArray);

  XLSX.utils.book_append_sheet(workbook, worksheet, fileName);

  XLSX.writeFile(
    workbook,
    `${new Date().toLocaleDateString("de-DE")}-${fileName}.xlsx`,
    { compression: true }
  );
};

function App() {
  const [dataArray, setDataArray] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    console.log("dataArray", dataArray);
  }, [dataArray]);

  const deleteData = (name: string) => {
    setDataArray(dataArray.filter((data) => data.name !== name));
  };

  return (
    <div className="w-full flex flex-col space-y-10 items-center h-screen justify-center">
      <Bieter setDataArray={setDataArray} />
      <div className="container grid grid-cols-8 h-[60px] gap-4">
        {dataArray.map((data, index) => (
          <div
            key={index}
            className="border-2 p-4 flex flex-col items-center rounded-md"
          >
            <h2 className="text-md mb-2">{data.name}</h2>
            <Button onClick={() => deleteData(data.name)}>
              <Trash className="size-4 mr-2" />
              Löschen
            </Button>
          </div>
        ))}
      </div>
      <div className={cn("hidden space-x-2 bg-accent p-3 rounded-md", dataArray.length != 0 && "flex")}>
        <Input placeholder="Dateiname" onChange={(e) => setFileName(e.target.value)} />
        <Button
          variant={"outline"}
          disabled={fileName === ""}
          onClick={() => exportData(dataArray, fileName)}
        >
          <Save className="size-4 mr-2" />
          Exportieren
        </Button>
      </div>
    </div>
  );
}

export default App;
