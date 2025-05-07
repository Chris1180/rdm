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

import eu.europa.europarl.csio.elegislate.domain.Rules;



public class ExcelExporter {
	private XSSFWorkbook workbook;
    private XSSFSheet rulesSheet;
    private List<Rules> listReportRules;
    
    public ExcelExporter(List<Rules> listRules) {
        this.listReportRules = listRules;
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
        rulesSheet.setColumnWidth(0, 12*256);
        createCell(rowRules, 0, "SEF", style);
        rulesSheet.setColumnWidth(1, 6*256);
        createCell(rowRules, 1, "DG\nNr", style);
        rulesSheet.setColumnWidth(2, 15*256);
        createCell(rowRules, 2, "DG Name", style);
        rulesSheet.setColumnWidth(3, 30*256);
        createCell(rowRules, 3, "Program", style);
        rulesSheet.setColumnWidth(4, 70*256);
        createCell(rowRules, 4, "Project_Name", style);
        rulesSheet.setColumnWidth(5, 12*256);
        createCell(rowRules, 5, "Project \nStart", style);
        rulesSheet.setColumnWidth(6, 12*256);
        createCell(rowRules, 6, "Project \nEnd", style);
        rulesSheet.setColumnWidth(7, 12*256);
        createCell(rowRules, 7, "Project \nStatus", style);
        
    }
    
    private void createCell(Row row, int columnCount, Object value, CellStyle style) {
        //Line commented because it slows down the process of export
    	//sheet.autoSizeColumn(columnCount);
    	
    	//DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");  
    	CreationHelper createHelper = workbook.getCreationHelper();
    	Cell cell = row.createCell(columnCount);
    	if (value instanceof Integer) {
        	cell.setCellValue((Integer) value);
        	return;
		}
    	if (value instanceof String) {
    		cell.setCellValue((String) value);
    		return;
		}
    	if (value instanceof Date) {
    		cell.setCellValue((Date)value);
    		style.setDataFormat(createHelper.createDataFormat().getFormat("dd/mm/yyyy"));
    		cell.setCellStyle(style);
        	return;
		}
    	
    	/*
    	if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else if (value instanceof Date) {
            cell.setCellValue((String) dateFormat.format(value));
        } else if (value instanceof Float) {
            //cell.setCellValue((Float)value*100);
        	cell.setCellValue(Math.round((Float)value*100));
        }
        else {
        	//cell.setCellType(CellType.STRING);
            cell.setCellValue((String) value);
        }
        cell.setCellStyle(style);*/
    }
    
    private void writeDataLines() {
        int rowCount = 1;
 
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setFontHeight(12);
        style.setFont(font);
                 
        for (Rules data : listReportRules) {
            Row row = rulesSheet.createRow(rowCount++);
            int columnCount = 0;
             
            createCell(row, columnCount++, data.getId(), style);
            createCell(row, columnCount++, data.getLabel(), style);
            createCell(row, columnCount++, data.getNestedCondition(), style);
            createCell(row, columnCount++, data.getOrder(), style);
            createCell(row, columnCount++, data.getPart(), style);
            createCell(row, columnCount++, data.getRuleCondition(), style);
            createCell(row, columnCount++, data.getStyle(), style);
             
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
