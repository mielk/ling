Attribute VB_Name = "modExcelSheets"
Option Compare Database
Option Explicit


Private Const CLASS_NAME As String = "modSheets"



'*********************************************************************
'   Comments:       Returns the sheet with specified name from a specified workbook.
'
'   Arguments:      book        Workbook which worksheet is stored in.
'                   sheetName   Name of worksheet.
'
'   Returns:        Worksheet   Worksheet within a specified workbook with a specified name.
'                               If a given workbook doesn't exist or is closed Nothing is returned.
'                               If a given workbook doesn't contain a worksheet with a specified
'                               name Nothing is returned.
'*********************************************************************
Public Function getSheet(book As Excel.Workbook, sheetName As String) As Excel.Worksheet
    On Error Resume Next
    Set getSheet = book.Worksheets(sheetName)
End Function





'*********************************************************************
'   Comments:       Returns the last non-empty row in the given column of the given sheet.
'
'   Arguments:      sheet       Worksheet.
'                   column      Index of column for which the last row is to be returned.
'
'   Returns:        Long        Index of the last non-empty row in the specified column.
'*********************************************************************
Public Function getColumnLastRow(sheet As Excel.Worksheet, column As Long) As Long
    getColumnLastRow = sheet.Cells(sheet.Rows.count, column).End(xlUp).Row
End Function





'*********************************************************************
'   Comments:       Insert validation as list to specified range [r].
'
'   Arguments:      r           Range when validation should be inserted.
'                   list        String represenation of a validation to be inserted.
'
'   Return:         Boolean     True - if a validation has been inserted without any errors.
'                               False - if errors occured while inserting validation.
'*********************************************************************
Public Function insertValidationList(r As Excel.Range, list As String, _
                        Optional inputTitle As String = "", Optional errorTitle As String = "", _
                        Optional inputMessage As String = "", Optional errorMessage As String = "") As Boolean
    '-----------------------------------------------------
    Const METHOD_NAME As String = "insertValidationList"
    '-----------------------------------------------------

    
    If r Is Nothing Then GoTo NoRangeException
    
    With r.Validation
    
        On Error Resume Next        'This statement can raise an error if there is no validation in this range currently.
        Call .Delete
        
        On Error GoTo ListInsertionException
        Call .Add(Type:=xlValidateList, AlertStyle:=xlValidAlertStop, Operator:= _
                  xlBetween, Formula1:="=" & list)
                  
        On Error Resume Next
        .inputTitle = inputTitle
        .inputMessage = inputMessage
        .errorTitle = errorTitle
        .errorMessage = errorMessage

    End With

    
    insertValidationList = True
    
    
    Exit Function
    
    
    
'----------------------------
ListInsertionException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Unknown error when inserting validation list " & list & " into a worksheet " & r.Parent.Name)
    Exit Function

NoRangeException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Error when trying to insert list " & list & "; No range selected.")

End Function





'*********************************************************************
'   Comments:       Insert validation for numeric to specified range [r].
'
'   Arguments:      r           Range when validation should be inserted.
'
'
'   Return:         Boolean     True - if a validation has been inserted without any errors.
'                               False - if errors occured while inserting validation.
'*********************************************************************
Public Function insertValidationNumeric(r As Excel.Range, validationType As Excel.XlDVType, _
                        minLimit As Double, maxLimit As Double, _
                        Optional inputTitle As String = "", Optional errorTitle As String = "", _
                        Optional inputMessage As String = "", Optional errorMessage As String = "") As Boolean
    '-----------------------------------------------------
    Const METHOD_NAME As String = "insertValidationNumeric"
    '-----------------------------------------------------

    
    If r Is Nothing Then GoTo NoRangeException
    
    With r.Validation
    
        On Error Resume Next        'This statement can raise an error if there is no validation in this range currently.
        Call .Delete
        
        On Error GoTo InsertValidationException
        Call .Add(Type:=validationType, AlertStyle:=xlValidAlertStop, Operator:= _
                  xlBetween, Formula1:=minLimit, Formula2:=maxLimit)
                  
        On Error Resume Next
        .inputTitle = inputTitle
        .inputMessage = inputMessage
        .errorTitle = errorTitle
        .errorMessage = errorMessage

    End With

    
    insertValidationNumeric = True
    
    
    Exit Function
    
    
    
'----------------------------
InsertValidationException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Unknown error when inserting validation rule for numeric into a worksheet " & r.Parent.Name)
    Exit Function

NoRangeException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Error when trying to insert validation rule. No range selected.")


End Function







'*********************************************************************
'   Comments:       Returns the name of the worksheet containing the
'                   specified cell.
'*********************************************************************
Public Function getSheetName(cell As Excel.Range) As String
    Dim wks As Worksheet
    '-----------------------------------------------------
    
    On Error Resume Next
    Set wks = cell.Parent
    
    If Not wks Is Nothing Then
        getSheetName = wks.Name
    End If
End Function


