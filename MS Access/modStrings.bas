Attribute VB_Name = "modStrings"
Option Explicit


Private Const CLASS_NAME As String = "modStrings"
'-----------------------------------------------------



'*********************************************************************
'   Comments:       Returns data from textfile as an array of Strings where
'                   each row of array represents single line in textfile.
'
'   Arguments:      filePath            Path of the textfile to be read.
'
'   Returns:        Variant             Array of string lines stored in source textfile.
'*********************************************************************
Public Function textFileToArray(filepath As String) As Variant
    Const METHOD_NAME As String = "textFileToArray"
    '-----------------------------------------------------
    'Every time the result array is resized, many rows is added at the same time.
    'It allows to enhance performance, since array resizing is time-consuming operation.
    'This constant defines how many rows are being added every time the array is resized.
    Const REDIM_STEP As Long = 100000
    '-----------------------------------------------------
    Dim strArray() As String:                   ReDim strArray(1 To REDIM_STEP)
    Dim intFileNum As Integer
    Dim strSourceRow As String
    Dim lngRow As Long
    '-----------------------------------------------------
    
    
    
    intFileNum = FreeFile
    Open filepath For Input As #intFileNum
        Do Until EOF(intFileNum)
            Line Input #intFileNum, strSourceRow
                lngRow = lngRow + 1
                
                'If index number of current row exceeds current array's bound,
                'array is resized to be able to hold next lines of data.
                If lngRow > UBound(strArray) Then
                    ReDim Preserve strArray(1 To UBound(strArray) + REDIM_STEP)
                End If
                
                strArray(lngRow) = strSourceRow
                
        Loop
    Close #intFileNum
    
    
    'At this point result array usually counts more rows than textfile, because
    'the array was resized by adding many rows at the same time to minimize the
    'number of time-consuming resizing operations.
    'All the extra array slots are now deleted in order to adjust size of array
    'to its content.
    If lngRow Then
        ReDim Preserve strArray(1 To lngRow)
        textFileToArray = strArray
    End If
    
    
End Function





'**************************************************************************
' Name:       startsWith
'
' Comment:    Checks if the given string starts with the specified
'             prefix.
'
' Parameters:
'   str       String to be checked.
'   prefix    The prefix.
'   isCaseSensitive
'             Optional parameter of Boolean type.
'             It determines if text matching is case sensitive.
'             If this value is set to True, searching is case sensitive -
'             a letter in lowercase is treated as different than the same
'             letter in uppercase (i.e. a != A).
'             If this value is set to False, it doesn't matter if a letter
'             is in lowercase or in uppercase, since both of them are
'             considered as the same character (i.e. a = A).
'             Default value of this parameter is True.
'
' Returns:
'   Boolean   True - if string str starts with the given prefix.
'             False - otherwise.
'**************************************************************************
Public Function startsWith(str As String, prefix As String, _
            Optional isCaseSensitive As Boolean = True) As Boolean
    Const METHOD_NAME As String = "startsWith"
    '-----------------------------------------------------
    Dim uCompareMethod As VbCompareMethod
    '-----------------------------------------------------
    
    If isCaseSensitive Then uCompareMethod = vbBinaryCompare Else uCompareMethod = vbTextCompare
        
    If StrComp(Left$(str, Len(prefix)), prefix, uCompareMethod) = 0 Then startsWith = True
    
End Function








'**************************************************************************
' Name:         printToTextFile
'
' Description:  Method to print the given content (String or array) into
'               the given textfile.
'
' Parameters:
'   content
'               Content to be printed out in a textfile.
'   filepath
'               The path of a textfile in which the given content should be
'               printed.
'   override
'               Optional parameter. Determines if the given content should
'               be appended to the existing content of this textfile or if
'               it should override this content.
'**************************************************************************
Public Sub printToTextFile(content As Variant, filepath As String, _
                    Optional override As Boolean = False)
    Const METHOD_NAME As String = "printToTextFile"
    '----------------------------------------------
    
    'Method checks if [content] parameter is not an object, since objects
    'cannot be printed.
    If IsObject(content) Then GoTo ObjectException
    
    
    'If the parameter [override] is set to True, method deletes the current
    'textfile (if this textfile exists). This textfile will be created from
    'scratch later on.
    'If override Then Call DeleteFile(filepath)
    
    

    Call printToTextFile_primitiveValues(content, filepath)
    
    
    Exit Sub
    
    
'----------------------------------------------
ObjectException:
    'error handler
    Exit Sub

DimensionsException:
    'error handler

End Sub


'**************************************************************************
' Name:         printToTextFile_primitiveValues
'
' Opis:         Submethod to print primitive values to a textfile.
'**************************************************************************
Private Sub printToTextFile_primitiveValues(content As Variant, _
                                        filepath As String)
    Dim iFile As Integer
    iFile = FreeFile()
    
    Open filepath For Append As #iFile
    Print #iFile, content
    Close iFile
End Sub
