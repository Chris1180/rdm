package eu.europa.europarl.csio.elegislate.controller;


import java.io.IOException;
import java.util.Date;
import java.util.List;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.IgnoredErrorType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import eu.europa.europarl.csio.elegislate.domain.RuleExportDto;




public class ExcelExporter {
	private XSSFWorkbook workbook;
    private XSSFSheet rulesSheet;
    
    private List<RuleExportDto> listExportRules;

    public ExcelExporter(List<RuleExportDto> exportRules) {
        this.listExportRules = exportRules;
        workbook = new XSSFWorkbook();
    }

    private void writeHeaderLine() {
    	rulesSheet = workbook.createSheet("Rules");
    	
        Row rowRules = rulesSheet.createRow(0);
        
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeight(12);
        style.setFont(font);
        style.setWrapText(true);
        rulesSheet.setAutoFilter(new CellRangeAddress(0, 0, 0, 8));
        // Supprime l'erreur affichée dans excel indiquant q"un chiffre est stocké sous forme de texte 
        rulesSheet.addIgnoredErrors(new CellRangeAddress(1, 2000, 1, 1), IgnoredErrorType.NUMBER_STORED_AS_TEXT);
        
        
        //La première ligne reste fixe
        rulesSheet.createFreezePane(0, 1);
        rulesSheet.setColumnWidth(0, 6 * 256);   // Rule ID
        createCell(rowRules, 0, "Rule ID", style);

        rulesSheet.setColumnWidth(1, 6 * 256);   // Priority Order
        createCell(rowRules, 1, "Priority Order", style);

        rulesSheet.setColumnWidth(2, 15 * 256);  // Part
        createCell(rowRules, 2, "Part", style);

        rulesSheet.setColumnWidth(3, 35 * 256);  // Label
        createCell(rowRules, 3, "Label", style);

        rulesSheet.setColumnWidth(4, 6 * 256);   // Condition ID
        createCell(rowRules, 4, "Condition ID", style);

        rulesSheet.setColumnWidth(5, 35 * 256);  // Text Condition
        createCell(rowRules, 5, "Text Condition", style);

        rulesSheet.setColumnWidth(6, 6 * 256);   // Command Lang
        createCell(rowRules, 6, "Command Lang", style);

        rulesSheet.setColumnWidth(7, 25 * 256);  // Command
        createCell(rowRules, 7, "Command", style);

        rulesSheet.setColumnWidth(8, 6 * 256);   // Nested Cmd ID
        createCell(rowRules, 8, "Nested Cmd ID", style);

        rulesSheet.setColumnWidth(9, 6 * 256);   // Nested Cmd Lang
        createCell(rowRules, 9, "Nested Cmd Lang", style);

        rulesSheet.setColumnWidth(10, 25 * 256); // Nested Cmd
        createCell(rowRules, 10, "Nested Cmd", style);

        rulesSheet.setColumnWidth(11, 35 * 256); // Comment
        createCell(rowRules, 11, "Comment", style);
        
    }
    
    private void createCell(Row row, int columnCount, Object value, CellStyle style) {
        CreationHelper createHelper = workbook.getCreationHelper();
        Cell cell = row.createCell(columnCount);
        
        if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        } else if (value instanceof Long) {
            cell.setCellValue((Long) value);
        } else if (value instanceof String) {
            cell.setCellValue((String) value);
        } else if (value instanceof Date) {
            cell.setCellValue((Date) value);
            style.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy"));
            cell.setCellStyle(style);
        }

        cell.setCellStyle(style);
    }

    
    private void writeDataLines() {
    int rowCount = 1;

    CellStyle style = workbook.createCellStyle();
    XSSFFont font = workbook.createFont();
    font.setFontHeight(12);
    style.setFont(font);

    for (RuleExportDto data : listExportRules) {
        Row row = rulesSheet.createRow(rowCount++);
        int col = 0;

        createCell(row, col++, data.getRuleId(), style);                           // ✅ doit renvoyer 2, 3, 4…
        createCell(row, col++, data.getPriorityOrder(), style);
        createCell(row, col++, data.getPart(), style);
        createCell(row, col++, data.getLabel(), style);
        createCell(row, col++, data.getConditionId(), style);
        createCell(row, col++, data.getTextCondition(), style);
        createCell(row, col++, data.getCommandLang(), style);
        createCell(row, col++, data.getCommand(), style);
        createCell(row, col++, data.getNestedConditionCommandId(), style);
        createCell(row, col++, data.getNestedConditionCommandLanguage(), style);
        createCell(row, col++, data.getNestedConditionCommandCommand(), style);
        createCell(row, col++, data.getComment(), style);
    }
}

    
    public void export(HttpServletResponse response) throws IOException {
        writeHeaderLine();
        writeDataLines();
         
        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
         
        outputStream.close();
         
    }
}
