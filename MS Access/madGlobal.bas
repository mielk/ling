Attribute VB_Name = "madGlobal"
Option Compare Database
Option Explicit

Private Const CLASS_NAME As String = "madGlobal"

Public Const DEBUG_MODE As Boolean = False
Public Const MAIN_FOLDER_PATH As String = "\\svrwar-data01\Manual Adjustment Database\"


Public m As Main
Public d As Database






Public Function ini()
    
    'Adds reference to Scripting.Runtime
    'Call loadScriptingRuntimeReference

    'Creates and initializes object of class Main.
    Set m = New Main
    Set d = New Database
    With m
        Call .ini
        Call .logUser
    End With
    
End Function
