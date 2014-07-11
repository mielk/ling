Attribute VB_Name = "modForms"
Option Compare Database
Option Explicit




'********************************************************************
'   Description:    Function to check if the given control has focus.
'********************************************************************
Public Function hasFocus(ctrl As control) As Boolean
    Dim focusControl As control
    '-----------------------------------------------------
    
    On Error GoTo errHandler
    Set focusControl = Screen.activeControl

    If Not focusControl Is Nothing Then
        With focusControl
            If ctrl.Name = .Name Then
                If ctrl.Parent.Name = .Parent.Name Then
                    hasFocus = True
                End If
            End If
        End With
    End If
    
    
'-----------------------------------------------------
errHandler:
    
End Function
