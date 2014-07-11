Attribute VB_Name = "modInternet"
Option Explicit

Private Const SW_SHOW = 5       ' Displays Window in its current size and position
Private Const SW_SHOWNORMAL = 1 ' Restores Window if Minimized or Maximized

Private Declare Function ShellExecute Lib "shell32.dll" Alias "ShellExecuteA" _
            (ByVal hwnd As Long, ByVal lpOperation As String, _
             ByVal lpFile As String, ByVal lpParameters As String, _
             ByVal lpDirectory As String, ByVal nShowCmd As Long) As Long

Private Declare Function FindExecutable Lib "shell32.dll" Alias "FindExecutableA" _
            (ByVal lpFile As String, ByVal lpDirectory As String, ByVal lpResult As String) As Long

Public Function getDefaultBrowser() As String
    Dim FileName As String, Dummy As String
    Dim BrowserExec As String * 255
    Dim RetVal As Long
    Dim FileNumber As Integer
    
    ' First, create a known, temporary HTML file
    BrowserExec = Space(255)
    FileName = "C:\tm\_makra\temphtm.html"
    FileNumber = FreeFile                    ' Get unused file number
    Open FileName For Output As #FileNumber  ' Create temp HTML file
        Write #FileNumber, "<HTML> <\HTML>"  ' Output text
    Close #FileNumber                        ' Close file
    ' Then find the application associated with it
    RetVal = FindExecutable(FileName, Dummy, BrowserExec)
    BrowserExec = Trim(BrowserExec)
    
    getDefaultBrowser = Trim(BrowserExec)
    
    Kill FileName                   ' delete temp HTML file
    
End Function



















Public Sub IE_Automation()
    Dim i As Long
    Dim IE As Object
    Dim objElement As Object
    Dim objCollection As Object
 
    ' Create InternetExplorer Object
    Set IE = CreateObject("InternetExplorer.Application")
 
    ' You can uncoment Next line To see form results
    IE.Visible = False
 
    ' Send the form data To URL As POST binary request
    IE.Navigate "http://www.onet.pl/"
 
    ' Statusbar
    Application.StatusBar = "www.onet.pl is loading. Please wait..."
 
    ' Wait while IE loading...
    Do While IE.Busy
        Application.Wait DateAdd("s", 1, Now)
    Loop
 
    ' Find 2 input tags:
    '   1. Text field
    '   <input type="text" class="textfield" name="s" size="24" value="" />
    '
    '   2. Button
    '   <input type="submit" class="button" value="" />
    
    Application.StatusBar = "Search form submission. Please wait..."
 
    Set objCollection = IE.document.getElementsByTagName("body")
 
    i = 0
    While i < objCollection.Length
        If objCollection(i).Name = "s" Then
 
            ' Set text for search
            objCollection(i).Value = "excel vba"
 
        Else
            If objCollection(i).Type = "submit" And _
               objCollection(i).Name = "" Then
 
                ' "Search" button is found
                Set objElement = objCollection(i)
 
            End If
        End If
        i = i + 1
    Wend
    objElement.Click    ' click button to search
    
    ' Wait while IE re-loading...
    Do While IE.Busy
        Application.Wait DateAdd("s", 1, Now)
    Loop
 
    ' Show IE
    IE.Visible = True
 
    ' Clean up
    Set IE = Nothing
    Set objElement = Nothing
    Set objCollection = Nothing
 
    Application.StatusBar = ""
End Sub

