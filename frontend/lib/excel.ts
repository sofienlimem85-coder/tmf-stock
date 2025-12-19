import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string, headers?: string[]) {
  // Préparer les données pour Excel
  const worksheetData = data.map((item) => {
    const row: any = {};
    Object.keys(item).forEach((key) => {
      // Exclure les champs internes comme _id, __v, etc.
      if (!key.startsWith('_') && key !== '__v') {
        row[key] = item[key];
      }
    });
    return row;
  });

  // Créer le workbook et la worksheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Générer le fichier Excel
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

