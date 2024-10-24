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

  const [countries, setCountries] = useState(undefined);
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
    
    useEffect(() => {
      const fetchData = async (headers_row, data_row, init, end) => {
        
        var result = undefined;

        try {
          const response = await fetch("/resources/API_NY.GDP.PCAP.CD_DS2_en_excel_v2_31806.xls");
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const arrayBuffer = await response.arrayBuffer();
          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: "array"});
        
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          
          //Extraer datos del eje X desde la fila 4, columnas 35 a 65        
          const labels = [];
          readSheetRow(labels, headers_row, init, end, sheet);  
          readSheetRow(values, data_row, init, end, sheet);
          
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

        } catch (error) {
          console.error("Error fetching or processing Excel file:", error);
        }  

        console.log("finally")        
        console.log(result)
        return result;
      };

      const readSheetRow = (rowList, rowIndex, init, end, sheet) => {
        for (let col = init; col <= end; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: col });
            const cell = sheet[cellAddress];
            rowList.push(cell ? cell.v : "Col${col}");
          }
      }

      const loadData = async () => {
        const result = await fetchData(3, 54, 14, 64);
        setData(result);
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

  return (
    <div className="pibChart">
        <h1>Cuba PIB per capita (US$)</h1>
        <select></select>
        <Line data={data} options={options}/>
    </div>);
    
};
 export default PibChart;