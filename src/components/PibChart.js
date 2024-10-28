import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import "./PibChart.css";

const PibChart = () => {

  const [sheet, setSheet] = useState(undefined);
  const [countries, setCountries] = useState(undefined);
  const [selectedCountry, setSelectedCountry] = useState("Cuba");
  const values = [];

  const [data, setData] = useState({
        labels: [],
        datasets: [
            {
                label: "PIB",
                data: values,
                fill: false,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
            },
        ],
    });
    
    const fetchData = async (headers_row, data_row, init, end, sheet1) => {
        
      var result = undefined;

      //Extraer datos del eje X desde la fila 4, columnas 35 a 65        
      const labels = [];
      console.log("sheet1", sheet1);
      readSheetRange(labels, headers_row, headers_row, init, end, sheet1);  
      readSheetRange(values, data_row, data_row, init, end, sheet1);
                  
        result = {
          labels: labels,
          datasets: [
            {
              label: "PIB",
              data: values,
              fill: false,
              backgroundColor: "rgba(75,192,192,0.4)",
              borderColor: "rgba(75,192,192,1)",
            },
          ],
        };  

      return result;
    };

    const readSheetRange = (rowList, rowInit, rowEnd, colInit, colEnd, sheet1) => {
      for (let row = rowInit; row <= rowEnd; row++) {
        for (let col = colInit; col <= colEnd; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = sheet1[cellAddress];
            rowList.push(cell ? cell.v : "Col${col}");
          }
        }
    }

    useEffect(() => {

      const fetchCountries = (sheet1) => {
        const countriesNew = [];
        readSheetRange(countriesNew, 4, 269, 0, 0, sheet1);
        setCountries(countriesNew);
        return countriesNew;
      }

      const loadData = async () => {
        try {
          const response = await fetch("/resources/API_NY.GDP.PCAP.CD_DS2_en_excel_v2_31806.xls");
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const arrayBuffer = await response.arrayBuffer();
          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: "array"});
        
          const sheetName = workbook.SheetNames[0];
          const sheet1 = workbook.Sheets[sheetName];
          setSheet(sheet1);

          const result = await fetchData(3, 54, 4, 64, sheet1);
          fetchCountries(sheet1); 
          setData(result);
                  
        } catch (error) {
          console.error("Error fetching or processing Excel file:", error);
        }
      };
      loadData();
    }, []);

  if (!data.labels.length) {
    return <div>Loading data...</div>;
  }

  const options = {
    responsive: true,
    plugins: {
        tooltip: {
            enabled: true,
            mode: "index",
            intersect: false,
            callbacks: {
                label: function (tooltipItem) {
                    return `PIB: ${tooltipItem.raw.toFixed(0)}`;
                },
            },
        },
    },
    scales: {
        x: {
            display: true,
            title: {
                display: true,
                text: "Año",
            },
        },
        y: {
            display: true,
            title: {
                display: true,
                text: "PIB",
            },
        },        
    },
  };

  const handleChange = async (event) => {
    setSelectedCountry(event.target.value);
    const index = countries.indexOf(event.target.value);
    try {
      console.log("index", index+3)
      const valuesNew = [];
      readSheetRange(valuesNew, index + 4, index + 4, 4, 64, sheet);
      const dataNew = {
        labels: data.labels,
        datasets: [
            {
                label: "PIB",
                data: valuesNew,
                fill: false,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
            },
        ],
      };
      setData(dataNew);
      console.log("handlechange:", result)
    } catch(error) {
      console.error()
    }
  }

  return (
    <div className="pibChart">
        <h1>{selectedCountry} PIB per capita (US$)</h1>
        <div className="flex">
          <Line data={data} options={options}/>
        </div>
        <select value={selectedCountry} onChange={handleChange}>          
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}          
        </select>
    </div>);
    
};
 export default PibChart;