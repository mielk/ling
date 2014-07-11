Attribute VB_Name = "modApplication"
Option Explicit



Public Sub changeSettings(bScreen As Boolean, bEvents As Boolean, xEnableCancelKey As XlEnableCancelKey)
    With Application
        bScreen = .ScreenUpdating: .ScreenUpdating = False
        bEvents = .EnableEvents: .EnableEvents = False
        xEnableCancelKey = .EnableCancelKey: .EnableCancelKey = xEnableCancelKey
    End With
End Sub



Public Sub restoreSettings(bScreen As Boolean, bEvents As Boolean, Optional xEnableCancelKey As XlEnableCancelKey = xlErrorHandler)
    On Error Resume Next
    With Application
        .EnableEvents = bEvents
        .ScreenUpdating = bScreen
        .EnableCancelKey = xEnableCancelKey
    End With
End Sub



'*********************************************************************
'   Comments:       Undo the previous pasting and paste the data again as values.
'*********************************************************************
Public Sub pasteAsValues(rng As Range)
    Dim bScreen As Boolean, bEvents As Boolean
    
    With Application
        bScreen = .ScreenUpdating: .ScreenUpdating = False
        bEvents = .EnableEvents: .EnableEvents = False
        
        Call .Undo
        Call rng.PasteSpecial(xlPasteValues)
        
        .CutCopyMode = False
        .ScreenUpdating = bScreen
        .EnableEvents = bEvents
    End With
End Sub



'*********************************************************************
'   Comments:       This function is used to display in Excel whether
'                   macros are enabled. If macros are disabled cell
'                   containing this function will raise an error.
'*********************************************************************
Public Function areMacrosEnabled() As Boolean
    areMacrosEnabled = True
End Function
