//
//  ViewController.swift
//  B.T.A.P.
//
//  Created by Sherwood Chuang on 11/20/15.
//  Copyright © 2015 Vertically Integrated Projects. All rights reserved.
//

import UIKit
import AVFoundation

class Module_FillInBlank: UIViewController, AVAudioPlayerDelegate, AVAudioRecorderDelegate {
    
    // Sequence strings
    let sequence1 : [String] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    let cueSeq1 : [String] = ["jah", "feh", "mah", "ah", "mah", "juh", "juh", "ah", "seh", "oct", "noh", "deh"]
    let seq1Size = 11; // Subtract 1 from size for indexing
    
    let sequence2 : [String] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    let cueSeq2 : [String] = ["wuh", "tuh", "thruh", "fuh", "fuh", "sih", "nuh", "tuh"]
    let seq2Size = 9;
    
    let sequence3 : [String] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    let cueSeq3 : [String] = ["muh", "tuh", "weh", "thuh", "fruh", "sah", "suh"]
    let seq3Size = 6
    
    let sequence4 : [String] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
    let cueSeq4 : [String] = ["ah", "buh", "suh", "duh", "eh", "eh", "juh", "huh", "ah", "juh", "kuh", "eh", "eh", "eh", "uh", "puh", "cuh", "ah", "eh", "tuh", "yuh", "vuh", "duh", "eh", "wah", "zuh"]
    let seq4Size = 25
    
    let numOfSeq = 4
    
    // Series creation variables
    var startNum:Int!
    var endNum:Int!
    var theSize:Int!
    var theSeq:[String]!
    var theCue:[String]!
    
    // Text to Speech variables
    var readOutString: String!
    let synth = AVSpeechSynthesizer()
    var readText = AVSpeechUtterance(string: "")
    var phonemicCue = AVSpeechUtterance(string: "")
    var cueString: String!
    
    // Module properties
    let module = "FillInBlank"
    var curStep = 0
    let numSteps = 5
    let screenSize: CGRect = UIScreen.main.bounds
    
    //Audio Recording Properties
    var recorder: AVAudioRecorder!
    //var player: AVAudioPlayer!
    var filename: String!
    var audioFiles: [String] = [""]
    
    // Set up data file header
    let currDate:Date = Date()
    let dateFormatter:DateFormatter = DateFormatter()
    let testName = "Fill in the Blank Module"
    let currUserName = "Woody"
    var createFileSuccess:Bool!
    var currSess:String!
    let fm = FileManager.default
    let moduleFolderName = "Fill in the Blank Module Data"
    
    // Outlets
    @IBOutlet weak var fillinblank: UILabel!
   // @IBOutlet var recordButton: UIButton!
   // @IBOutlet var readButton: UIButton!
    @IBOutlet var hintButton: UIButton!
    @IBOutlet weak var instructionsOutlet: UILabel!
    @IBOutlet weak var nextButtonOutlet: UIButton!
    @IBOutlet weak var homeButton: UIButton!
    
    @IBAction func nextButton(_ sender: UIButton) {
        
        // Create filename to store recording
        let currFolder:URL = getCacheDirectory().appendingPathComponent(moduleFolderName)
        recorder.stop()
        filename = generateFileName(module)
        
        if curStep < numSteps - 1 {
            
            // Select random sequence
            let selectSeqNum = Int(arc4random_uniform(UInt32(numOfSeq)))
            switch selectSeqNum {
                case 0: theSeq = sequence1
                        theSize = seq1Size
                        theCue = cueSeq1
                case 1: theSeq = sequence2
                        theSize = seq2Size
                        theCue = cueSeq2
                case 2: theSeq = sequence3
                        theSize = seq3Size
                        theCue = cueSeq3
                case 3: theSeq = sequence4
                        theSize = seq4Size
                        theCue = cueSeq4
                default: theSeq = sequence1
                        theSize = seq1Size
                        theCue = cueSeq1
            }
            
            // Select random series of values from the selected sequence
            let seriesNum = Int(arc4random_uniform(UInt32(theSize))) // may have to fix since the system might generate a number too large for int constructor
            if (seriesNum < 2) {
                print("did A")
                startNum = 0
                endNum = 4
            } else if (seriesNum >= (theSize - 2)) {
                print("did B")
                startNum = theSize - 5
                endNum = theSize - 1
            } else {
                print("did C")
                startNum = seriesNum - 2
                endNum = seriesNum + 2
            }
            
            // Create the random string of values and the phonetic cue string
            print("startNum:\(startNum)")
            print("endNum:\(endNum)")
            print(theSeq)
            print(theSize)
            print(seriesNum)
            
            if (endNum == theSize || endNum == theSize - 1) {
                startNum = startNum - 1
                endNum = endNum - 1
            }

            var seqString = [theSeq[startNum], theSeq[startNum + 1], theSeq[startNum + 2], theSeq[endNum - 1], theSeq[endNum]]
            let outString = seqString
            var seqCue = [theCue[startNum], theCue[startNum+1], theCue[startNum+2], theCue[endNum - 1], theCue[endNum]]
            var readString = seqString
            let blankNum = Int(arc4random_uniform(UInt32(4)))
            readString[blankNum] = "blank"
            cueString = seqCue[blankNum]
            
            seqString[blankNum] = "_______"
            readOutString = "\(readString[0]), \(readString[1]), \(readString[2]), \(readString[3]), \(readString[4])"
            
            self.fillinblank?.text = "\(seqString[0]), \(seqString[1]), \(seqString[2]), \(seqString[3]), \(seqString[4])"

            curStep += 1
            
            // We need just to get the documents folder url
            let documentsUrl =  FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
            
            // now lets get the directory contents (including folders)
            do {
                let directoryContents = try FileManager.default.contentsOfDirectory(at: documentsUrl, includingPropertiesForKeys: nil, options: FileManager.DirectoryEnumerationOptions())
                
                
                //List of filenames
                var newItem: String
                var newList: [String] = [""]
                for item in directoryContents {
                    newItem = stripFile(item.absoluteString)
                    newList.append(newItem)
                }
                audioFiles = newList
                if audioFiles[0] == "" {
                    audioFiles.remove(at: 0)
                }
                print(audioFiles)
                
            } catch let error as NSError {
                print(error.localizedDescription)
            }
            if (createFileSuccess == true) {
                TextFileCollection().saveData("Original Question: \(seqString) \r\n Whole Question: \(outString) \r\nSaved File: \(filename) \r\n", saveFolder: currFolder, theUser: currUserName, theSess: currSess)
            }
        } else {
            performSegue(withIdentifier: "fillInBlankToMainMenu", sender: sender)
        }
    }
    
    
    // Actions
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //let nextblank = UIImage(named: "button_next") as UIImage?
        //let hintblank = UIImage(named: "button_hint") as UIImage?
        //nextButtonOutlet.setImage(nextblank, forState: . Normal)
        //hintButton.setImage(hintblank, forState: . Normal)
        
        // Create Naming Module Subdirectory
        TextFileCollection().createFolder(moduleFolderName)
        let currFolder:URL = getCacheDirectory().appendingPathComponent(moduleFolderName)
        
        // create text file header
        dateFormatter.dateFormat = "MM/dd/yyyy HH:mm"
        let DateInFormat:String = dateFormatter.string(from: currDate)
        dateFormatter.dateFormat = "MMddyyyyHHmm"
        currSess = dateFormatter.string(from: currDate)
        let header:String = "Test Name: " + testName + "\r\n" + " Current Time & Date: " + DateInFormat + "\r\n" + "User: " + currUserName + "\r\n"
        createFileSuccess = TextFileCollection().createFile(header, saveFolder: currFolder, theUser: currUserName, theSess: currSess)
        dateFormatter.timeStyle = .short
        let timeString = dateFormatter.string(from: currDate)
        dateFormatter.dateStyle = .short
        let dateString = dateFormatter.string(from: currDate)
        
        
        // add entry to database
        do {
            try TestSessionDataHelper.createTable()
            let userID = try TestSessionDataHelper.insert(
                UserSession(
                    SessionID: currSess,
                    User: currUserName,
                    StartTime: timeString,
                    Date: dateString,
                    StopTime: "",
                    TestDataFile: currUserName + "_" + currSess + ".txt"))
            print("UserID: \(userID)")
        } catch _{
            print("Data Didn't Save to Database")
        }
        do {
            if let sqlite_sessions = try TestSessionDataHelper.findAll() {
                for sess in sqlite_sessions {
                    print("\(sess.TestDataFile)")
                }
            }
        } catch _ {
            
        }
        
        setupRecorder(currFolder)
        recorder.record()
        
        //Navigation Controller
        self.navigationController?.title = "Fill in the Blank"
        
        //GUI Design
        let W = screenSize.width
        let H = screenSize.height
        //let buttonW = 0.2 * W
        //let buttonH = buttonW / sqrt(3)
        let textW = 0.8 * W
        let textH = textW / 8.0
        //let picW = W * 0.6
        //let picH = picW
        
        //recordButton.frame = CGRectMake(W * 0.04, H - 0.1 * W - buttonH - 44, buttonW, buttonH)
        hintButton.frame = CGRect(x: W * 0.43, y: H * 0.8, width: W * 0.15, height: W * 0.15)
        //playButton.frame = CGRectMake(W * 0.52,  H - 0.1 * W - buttonH - 44, buttonW, buttonH)
        nextButtonOutlet.frame = CGRect(x: W * 0.8, y: H * 0.8, width: W * 0.15, height: W * 0.15)
        instructionsOutlet.frame = CGRect(x: 0.1 * W, y: H * 0.1, width: textW, height: textH)
        homeButton.frame = CGRect(x: W*0.8, y: 15, width: W*0.15, height: W*0.15)
        
        let selectSeqNum = Int(arc4random_uniform(UInt32(numOfSeq)))
        
        // Select random sequence
        switch selectSeqNum {
        case 0: theSeq = sequence1
        theSize = seq1Size
        theCue = cueSeq1
        case 1: theSeq = sequence2
        theSize = seq2Size
        theCue = cueSeq2
        case 2: theSeq = sequence3
        theSize = seq3Size
        theCue = cueSeq3
        case 3: theSeq = sequence4
        theSize = seq4Size
        theCue = cueSeq4
        default: theSeq = sequence1
        theSize = seq1Size
        theCue = cueSeq1
        }
        
        let seriesNum = Int(arc4random_uniform(UInt32(theSize)))
        print(seriesNum)
        
        if (seriesNum < 2) {
            startNum = 0
            endNum = 4
        }else if (seriesNum >= (theSize-2)) {
            startNum = theSize - 5
            endNum = theSize - 1
        }else {
            startNum = seriesNum - 2
            endNum = seriesNum + 2
        }
        print(startNum)
        print(endNum)
        
        if (endNum == theSize || endNum == theSize - 1) {
            startNum = startNum - 1
            endNum = endNum - 1
        }
        
        var seqString = [theSeq[startNum], theSeq[startNum+1], theSeq[startNum+2], theSeq[endNum-1], theSeq[endNum]]
        let outString = seqString
        var seqCue = [theCue[startNum], theCue[startNum+1], theCue[startNum+2], theCue[endNum-1], theCue[endNum]]
        var readString = seqString
        
        let blankNum = Int(arc4random_uniform(UInt32(4)))
        readString[blankNum] = "blank"
        cueString = seqCue[blankNum]
        seqString[blankNum] = "_______"
        readOutString = "\(readString[0]), \(readString[1]), \(readString[2]), \(readString[3]), \(readString[4])"
        
        self.fillinblank?.text = "\(seqString[0]), \(seqString[1]), \(seqString[2]), \(seqString[3]), \(seqString[4])"
        
        if (createFileSuccess == true) {
            TextFileCollection().saveData("Original Question: \(seqString) \r\n Whole Question: \(outString) \r\nSaved File: \(filename) \r\n", saveFolder: currFolder, theUser: currUserName, theSess: currSess)
        }
        
        
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    //@IBAction func Record(sender: UIButton) {
    //    if sender.titleLabel?.text == "Record" {
    //        setupRecorder()
    //        recorder.record()
    //        sender.setTitle("Stop", forState: .Normal)
    //        playButton.enabled = false
     //   } else {
       //     recorder.stop()
         //   sender.setTitle("Record", forState: .Normal)
          //  playButton.enabled = false
   //     }
        
  //  }
    
    // @IBAction func PlaySound(sender: UIButton) {
    //   if sender.titleLabel?.text == "Play" {
    //       recordButton.enabled = false
    //       sender.setTitle("Stop", forState: .Normal)
    //       preparePlayer()
    //       player.play()
    //   } else {
    //       player.stop()
    //       sender.setTitle("Play", forState: .Normal)
    //   }
    //  }

    @IBAction func Read(_ sender: UIButton) {
        readText = AVSpeechUtterance(string: readOutString)
        readText.rate = 0.5
        synth.speak(readText)
    }
    
    @IBAction func Hint(_ sender: UIButton) {
        phonemicCue = AVSpeechUtterance(string: cueString)
        phonemicCue.rate = 0.5
        synth.speak(phonemicCue)
    }
    
    //RANDOM INTEGER ARRAY GENERATOR
    func randInt(_ size: Int) -> [Int] {
        let numImages : UInt32 = UInt32(size)
        var randInts = [Int]()
        var genInt = Int(arc4random_uniform(numImages)) + 1
        var iterations = 0
        while randInts.count < Int(numImages) {
            if !randInts.contains(genInt) {
                randInts.append(genInt)
            } else {
                genInt = Int(arc4random_uniform(numImages)) + 1
            }
            print("Iterations: \(iterations+=1)")
            
        }
        print("Rand Ints \(randInts).")
        return randInts
    }
    
    //Recorder Setup
    func setupRecorder(_ saveFolder: URL) {
        
        filename = generateFileName(module) + ".m4a"
        
        let recordSettings = [
            AVFormatIDKey: NSNumber(value: kAudioFormatAppleLossless as UInt32),
            AVEncoderAudioQualityKey : AVAudioQuality.max.rawValue,
            AVEncoderBitRateKey : 320000,
            AVNumberOfChannelsKey: 2,
            AVSampleRateKey : 44100.0
        ] as [String : Any]
        do {
            recorder = try AVAudioRecorder(url: getFileURL(saveFolder), settings: recordSettings as [String : AnyObject])
        } catch {
            print("something wrong!")
        }
        recorder.delegate = self
        recorder.prepareToRecord()
    }
    
    func getCacheDirectory() -> URL {
        let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        
        return paths
    }
    
    func getFileURL(_ saveFolder: URL) -> URL {
        let path = saveFolder.appendingPathComponent(filename)
        print("GetFileURL() output -> " + filename)
        return path
    }
    
  //  func preparePlayer() {
  //      do {
  //          player = try AVAudioPlayer(contentsOfURL: getFileURL())
  //          player.delegate = self
  //          player.prepareToPlay()
  //          player.volume = 1.0
  //      } catch {
  //          print("something wrong")
  //      }
  //  }
    
    //func audioRecorderDidFinishRecording(recorder: AVAudioRecorder, successfully flag: Bool) {
      //  playButton.enabled = true
       // playButton.setTitle("Play", forState: .Normal)
    //}
    
    //func audioPlayerDidFinishPlaying(player: AVAudioPlayer, successfully flag: Bool) {
     //   recordButton.enabled = true
     //   playButton.setTitle("Play", forState: .Normal)
    //}
    
    func stripFile(_ filename: String) -> String {
        var substring = filename
        var index = filename.characters.index(of: "/")
        while index != nil {
            substring = substring.substring(from: index!)
            substring = String(substring.characters.dropFirst())
            index = substring.characters.index(of: "/")
        }
        return substring
    }
    
    func generateFileName(_ module: String) -> String {
        let todaysDate:Date = Date()
        let dateFormatter:DateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MM-dd-yy_HH:mm:ss"
        let DateInFormat:String = dateFormatter.string(from: todaysDate)
        return module + "_" + DateInFormat
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        let currFolder:URL = getCacheDirectory().appendingPathComponent(moduleFolderName)
        TextFileCollection().saveData("End of naming module \r\n", saveFolder: currFolder, theUser: currUserName, theSess: currSess)
        let backToMenu = segue.destination as! MainMenu
        backToMenu.fillInBlankAudioFiles = self.audioFiles
    }
    
    // Get everything after this
    
//    func getDocumentsDirectory() -> NSString {
//        let paths = NSSearchPathForDirectoriesInDomains(.DocumentDirectory, .UserDomainMask, true)
//        let documentsDirectory = paths[0]
//        return documentsDirectory
//    }
//    
//    func getFilesInDirectory(inputDirectory: NSString) -> [String] {
//        let fm = NSFileManager.defaultManager()
//        let items = try! fm.contentsOfDirectoryAtPath(inputDirectory as String)
//        var objects = [String] ()
//        for item in items {
//            if item.hasSuffix(".txt") {
//                objects.append(item)
//            }
//        }
//        return objects
//    }
    
//    func saveData() {
//        let savePath = getDocumentsDirectory().stringByAppendingPathComponent("data.txt")
//        let listOfFiles = getFilesInDirectory(getDocumentsDirectory())
//        dateFormatter.dateFormat = "MM-dd-yyyy HH:mm"
//        let DateInFormat:String = dateFormatter.stringFromDate(currDate)
//        let saveData = testName + "\r\n" + DateInFormat + "\r\n" + currUser + "\r\n" + filename + "\r\n"
//        do {
//            let userID = try TestSessionDataHelper.insert(
//                UserSession(
//                    SessionID: "11111",
//                    User: currUser,
//                    StartTime: "12:00 PM",
//                    Date: "01/01/16",
//                    StopTime: "1:00 AM",
//                    TestDataFile: "data.txt"))
//            print(userID)
//        } catch _{}
//        for file in listOfFiles {
//            // if the file already exists, open file and append to the end of it
//            if (file == "data.txt") {
//                do {
//                    let curText = try NSString(contentsOfFile: savePath, encoding: NSUTF8StringEncoding)
//                    curText.stringByAppendingString(saveData)
//                    try curText.writeToFile(savePath, atomically: false, encoding: NSUTF8StringEncoding)
//                } catch {}
//                // otherwise create the file and save the data
//            } else {
//                do {
//                    try saveData.writeToFile(savePath, atomically: false, encoding: NSUTF8StringEncoding)
//                } catch {}
//            }
//            
//        }
//    }
    
    
    
}


