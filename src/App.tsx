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
    const bieterData = d.data;

    finalArray.push(
      ...bieterData.map((data: any) => ({ teilnehmer: name, ...data }))
    );
  });

  return finalArray;
};


const newPivotArray = (data: any[]) => {
  const finalArray = [...data[0].data] as any[];

  console.log("data",data)

  const bieter = data.map((d) => d.name) as string[];

  const retArray = finalArray.map((p,i) => {
    
    let obj = {...p} as any;
    delete obj.Wert

    bieter.forEach((b) => {
      const bieterData = data.find((d) => d.name === b)?.data;
      const bieterValue = bieterData[i].Wert;


      obj[b] = bieterValue;
    })

    return obj;
  })



  return retArray;
}


const exportData = (data: any[], fileName: string) => {

  console.log("rawData",data)
  
  let finalArray = newArray(data);
  let pivotArray = newPivotArray(data);

  console.log({
    finalArray,pivotArray
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(finalArray);
  const worksheet2 = XLSX.utils.json_to_sheet(pivotArray);

  XLSX.utils.book_append_sheet(workbook, worksheet, "FormularDaten");
  XLSX.utils.book_append_sheet(workbook, worksheet2, "Pivotisiert");

  XLSX.writeFile(
    workbook,
    `${new Date().toLocaleDateString("de-DE")}-${fileName}.xlsx`,
    { compression: true }
  );
};

function App() {
  const [dataArray, setDataArray] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");



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
      <div
        className={cn(
          "hidden space-x-2 bg-accent p-3 rounded-md",
          dataArray.length != 0 && "flex"
        )}
      >
        <Input
          placeholder="Dateiname"
          onChange={(e) => setFileName(e.target.value)}
        />
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
