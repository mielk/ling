Attribute VB_Name = "modSheets"
Option Explicit


Private Const CLASS_NAME As String = "modSheets"



'*********************************************************************
'   Comments:       Returns the sheet with specified name from a specified workbook.
'
'   Arguments:      book        Workbook which worksheet is stored in.
'                   sheetName   Name of worksheet.
'
'   Returns:        Worksheet   Worksheet having a specified name stored in a specified workbook.
'                               If a given workbook doesn't exist or is closed Nothing is returned.
'                               If a given workbook doesn't contain a worksheet with a specified
'                               name Nothing is returned.
'*********************************************************************
Public Function getSheet(book As Workbook, sheetName As String) As Worksheet
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
Public Function getColumnLastRow(sheet As Worksheet, column As Long) As Long
    getColumnLastRow = sheet.Cells(sheet.Rows.Count, column).End(xlUp).Row
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
Public Function insertValidationList(r As Range, list As String, _
                        Optional inputTitle As String = "", Optional errorTitle As String = "", _
                        Optional inputMessage As String = "", Optional errorMessage As String = "") As Boolean
    Const METHOD_NAME As String = "insertValidationList"
    '--------------------------------------------------------
    

    If r Is Nothing Then GoTo NoRangeException
    
    With r.Validation
    
        On Error Resume Next        'This statement can raise an error if there is no validation in this range currently.
        Call .Delete
        
        On Error GoTo ListInsertionException
        Call .Add(Type:=xlValidateList, AlertStyle:=xlValidAlertStop, operator:= _
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
Public Function insertValidationNumeric(r As Range, validationType As XlDVType, _
                        minLimit As Double, maxLimit As Double, _
                        Optional inputTitle As String = "", Optional errorTitle As String = "", _
                        Optional inputMessage As String = "", Optional errorMessage As String = "") As Boolean
    Const METHOD_NAME As String = "insertValidationNumeric"
    '--------------------------------------------------------

    
    If r Is Nothing Then GoTo NoRangeException
    
    With r.Validation
    
        On Error Resume Next        'This statement can raise an error if there is no validation in this range currently.
        Call .Delete
        
        On Error GoTo InsertValidationException
        Call .Add(Type:=validationType, AlertStyle:=xlValidAlertStop, operator:= _
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
'   Comments:       Insert validation for text length to specified range [r].
'
'   Arguments:      r           Range when validation should be inserted.
'
'   Return:         Boolean     True - if a validation has been inserted without any errors.
'                               False - if errors occured while inserting validation.
'*********************************************************************
Public Function insertValidationTextLength(r As Range, xlOperator As XlFormatConditionOperator, textLength As Integer, _
                        Optional inputTitle As String = "", Optional errorTitle As String = "", _
                        Optional inputMessage As String = "", Optional errorMessage As String = "") As Boolean
    Const METHOD_NAME As String = "insertValidationTextLength"
    '--------------------------------------------------------
    
    If r Is Nothing Then GoTo NoRangeException
    
    With r.Validation
    
        On Error Resume Next        'This statement can raise an error if there is no validation in this range currently.
        Call .Delete
        
        On Error GoTo InsertValidationException
        Call .Add(Type:=xlValidateTextLength, AlertStyle:=xlValidAlertStop, _
                    operator:=xlOperator, Formula1:=textLength)
                  
        On Error Resume Next
        .inputTitle = inputTitle
        .inputMessage = inputMessage
        .errorTitle = errorTitle
        .errorMessage = errorMessage

    End With

    
    insertValidationTextLength = True
    
    
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
Public Function getSheetName(cell As Range) As String
    Const METHOD_NAME As String = "getSheetName"
    '-----------------------------------------------------
    Dim wks As Worksheet
    '-----------------------------------------------------
    
    On Error Resume Next
    Set wks = cell.Parent
    
    If Not wks Is Nothing Then
        getSheetName = wks.Name
    End If
End Function





'*********************************************************************
'   Comments:       Method to convert the values of cells in the given
'                   Range to numeric.
'                   If any cell in the given range is not a string
'                   represenation of number, it is ignored.
'*********************************************************************
Public Sub convertToNumeric(rng As Range)
    Const METHOD_NAME As String = "convertToNumeric"
    '-----------------------------------------------------
    'For better performance the given range is being loaded into an array.
    Dim arrCells As Variant
    Dim lngRow As Long
    Dim lngCol As Long
    '-----------------------------------------------------
    
    If rng Is Nothing Then GoTo NoRangeException
    
    
    'The given range is a single cell.
    If rng.Cells.Count = 1 Then
        If IsNumeric(rng.value) Then
            rng.value = rng.value * 1
        End If
    End If
    
    
    'Loading the given range into a temporary array.
    On Error GoTo RangeLoadingException
    arrCells = rng
    
    
    'The given range is an array.
    On Error GoTo 0
    If isNonEmptyArray(arrCells) Then
        For lngRow = LBound(arrCells, 1) To UBound(arrCells, 1)
            For lngCol = LBound(arrCells, 2) To UBound(arrCells, 2)
                If IsNumeric(arrCells(lngRow, lngCol)) Then
                    arrCells(lngRow, lngCol) = arrCells(lngRow, lngCol) * 1
                End If
            Next lngCol
        Next lngRow
    End If


    'Pasting the converted data back to the worksheet.
    On Error GoTo PasteException
    rng = arrCells


    Exit Sub


'-----------------------------------------------------
NoRangeException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "No range was given to this method")
    Exit Sub

RangeLoadingException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Error when loading the given range into an array")
    Exit Sub

PasteException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Error when pasting the converted values into the worksheet")

End Sub






'*********************************************************************
'   Comments:       Method to trim values of the given range.
'*********************************************************************
Public Sub trimRange(rng As Range)
    Const METHOD_NAME As String = "trimRange"
    '-----------------------------------------------------
    'For better performance the given range is being loaded into an array.
    Dim arrCells As Variant
    Dim lngRow As Long
    Dim lngCol As Long
    '-----------------------------------------------------
    
    If rng Is Nothing Then GoTo NoRangeException
    
    
    'The given range is a single cell.
    If rng.Cells.Count = 1 Then
        rng.value = Trim(rng.value)
    End If
    
    
    'Loading the given range into a temporary array.
    On Error GoTo RangeLoadingException
    arrCells = rng
    
    
    'The given range is an array.
    On Error GoTo 0
    If isNonEmptyArray(arrCells) Then
        For lngRow = LBound(arrCells, 1) To UBound(arrCells, 1)
            For lngCol = LBound(arrCells, 2) To UBound(arrCells, 2)
                arrCells(lngRow, lngCol) = Trim(arrCells(lngRow, lngCol))
            Next lngCol
        Next lngRow
    End If


    'Pasting the converted data back to the worksheet.
    On Error GoTo PasteException
    rng = arrCells


    Exit Sub


'-----------------------------------------------------
NoRangeException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "No range was given to this method")
    Exit Sub

RangeLoadingException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Error when loading the given range into an array")
    Exit Sub

PasteException:
    Call errorHandler(CLASS_NAME, METHOD_NAME, Err.Number, Err.Description, "Error when pasting the converted values into the worksheet")

End Sub

