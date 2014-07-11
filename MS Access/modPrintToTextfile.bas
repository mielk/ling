Attribute VB_Name = "modPrintToTextfile"
Option Explicit




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
    If override Then Call DeleteFile(filepath)
    
    
    If isNonEmptyArray(content) Then
        'There are different printing subroutines for 1D arrays and 2D
        'arrays. The [Select Case] statement below checks how many
        'dimensions the given array has and invokes the appropriate
        'subroutine based on that value.
        Select Case liczbaWymiarow(content)
            Case 1
                Call printToTextFile_1DArray(content, filepath)
            Case 2
                Call printToTextFile_2DArray(content, filepath)
            Case Else
                'It is impossible to print an array if it has more
                'tham two dimensions. In this case DimensionsException
                'is thrown.
                GoTo DimensionsException
        End Select
        
    Else
        'If the given content is not an array nor object, it must be
        'primitive. In this case printToTextFile_primitiveValues
        'subroutine is invoked.
        Call printToTextFile_primitiveValues(content, filepath)

    End If
    
    
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


'**************************************************************************
' Name:         printToTextFile_1DArray
'
' Opis:         Submethod to print one-dimensional array.
'**************************************************************************
Private Sub printToTextFile_1DArray(content As Variant, _
                                        filepath As String)
    Dim iFile As Integer
    Dim lRow As Long
                
    iFile = FreeFile()
                
    Open filepath For Append As #iFile
    For lRow = LBound(content, 1) To UBound(content, 1)
        Print #iFile, content(lRow)
    Next lRow
    Close iFile
    
End Sub


'**************************************************************************
' Name:         printToTextFile_2DArray
'
' Opis:         Submethod to print two-dimensional array to a textfile.
'**************************************************************************
Private Sub printToTextFile_2DArray(content As Variant, _
                                        filepath As String)
    Const SEPARATOR As String = ";"
    Dim iFile As Integer
    Dim lRow As Long
    Dim lCol As Long
    Dim sCol As String
                
    iFile = FreeFile()
                
    Open filepath For Append As #iFile
    For lRow = LBound(content, 1) To UBound(content, 1)
        'Value of the parameter [sCol] is cleared in every iteration
        'in order not to store a content from the previous array rows.
        sCol = ""
        
        'The loop below appends the value of each cell in the particular
        'row to [sCol] parameter, separating them from each other with
        'a character defined in [SEPARATOR] constant.
        For lCol = LBound(content, 2) To UBound(content, 2)
            sCol = sCol & content(lRow, lCol) & SEPARATOR
        Next lCol
        
       'Separator appended after the last item is being cut ...
        If Len(sCol) Then sCol = Left(sCol, Len(sCol) - 1)
       '... and ultimately the string stored in [sCol] parameter
       'is being printed to a textfile.
        Print #iFile, sCol
    Next lRow
    Close iFile
    
End Sub


