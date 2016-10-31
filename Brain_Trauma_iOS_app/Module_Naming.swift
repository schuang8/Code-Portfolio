//
//  ViewController.swift
//  B.T.A.P.
//
//  Created by Sherwood Chuang on 9/28/15.
//  Copyright © 2015 Vertically Integrated Projects. All rights reserved.
//
import SQLite
import UIKit
import AVFoundation
import Foundation

// Confrontation Naming Module



class Module_Naming: UIViewController, AVAudioPlayerDelegate, AVAudioRecorderDelegate {
    
    // Initiate Variables
    let module = "Naming"
    var curStep = 0
    var pic = 0
    var initArr = [0]
    var filenames: [String] = ["_baby_beh", "_book_buh", "_car_cah", "_cat_cah", "_dog_duh", "_flower_flah", "_pizza_pah", "_tree_trah", "_apple_ah", "_television_teh", "_chalk_chah", "_button_buh", "_bag_bah", "_cards_cah", "_telephone_teh", "_watch_wah", "_soap_soh", "_rubberduck_ruh", "_toothbrush_tuh", "_chair_chah", "_box_buh", "_coat_coh", "_bear_beh", "_shoe_shuh", "_bowl_buh", "_phone_fuh", "_door_duh", "_table_tay", "_couch_cuh", "_towel_tuh", "_thermometer_thuh", "_keys_keh", "_lamp_lah", "_pillow_pih", "_candy_cah"]
    var queueString: String!
    var picNum: Int!
    let numSteps = 5
    let screenSize: CGRect = UIScreen.main.bounds
    
    // Inititate Audio Recording Properties
    var recorder: AVAudioRecorder!
    //var player: AVAudioPlayer!
    var recordingSession: AVAudioSession!
    var filename: String!
    var audioFiles: [String] = [""]
    
    // Text to speech properties
    let synth = AVSpeechSynthesizer()
    var phoneticQueue = AVSpeechUtterance(string: "")
    
    
    // Set up data file header
    let currDate:Date = Date()
    let dateFormatter:DateFormatter = DateFormatter()
    let testName = "Naming Module"
    let currUserName = "Woody"
    var createFileSuccess:Bool!
    var currSess:String!
    let fm = FileManager.default
    let moduleFolderName = "Naming Module Data"
    
    // Outlets
    @IBOutlet var imageToName: UIImageView!
    @IBOutlet var hintButton: UIButton!
    @IBOutlet weak var instructionsOutlet: UILabel!
    @IBOutlet weak var nextButtonOutlet: UIButton!
    @IBOutlet weak var homeButton: UIButton!
    
    @IBAction func nextButton(_ sender: UIButton) {
        recorder.stop()
        
        // Create filename to store recording
        let currFolder:URL = getCacheDirectory().appendingPathComponent(moduleFolderName)
        filename = generateFileName(module)
        
        // Read in the filenames or pictures and load them
        if curStep < numSteps - 1{
            var currPic = Int(arc4random_uniform(UInt32(numSteps)))
            while (initArr.contains(currPic)) {
                currPic = Int(arc4random_uniform(UInt32(numSteps)))
            }
            print(currPic)
            initArr.append(currPic)
            imageToName.image = UIImage(named:"PictureIdentification_\(currPic).jpg")
            print("Current Picture: \(filenames[currPic])")
            queueString = findCue(filenames[currPic])
            print("Cue: \(queueString)")
            curStep += 1
            
            // now lets get the directory contents (including folders)
            do {
                let directoryContents = try FileManager.default.contentsOfDirectory(at: currFolder, includingPropertiesForKeys: nil, options: FileManager.DirectoryEnumerationOptions())
                
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
                TextFileCollection().saveData("Question: picture\(currPic)\(filenames[currPic]).jpg \r\n Saved File: \(filename) \r\n", saveFolder: currFolder, theUser: currUserName, theSess: currSess)
            }
        } else {
            let listOfFiles = TextFileCollection().getFilesInDirectory(currFolder)
            print(listOfFiles)
            performSegue(withIdentifier: "namingToMainMenu", sender: sender)
        }
        
    }
    
    // Actions

    
    override func viewDidLoad() {
        super.viewDidLoad()
        
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
        
        // Setup all buttons
        let nextName = UIImage(named: "button_next") as UIImage?
        nextButtonOutlet.setImage(nextName, for: UIControlState())
        let hintName = UIImage(named: "button_hint") as UIImage?
        hintButton.setImage(hintName, for: UIControlState())
        
        // Setup Recording properties
        setupRecorder(currFolder)
        recorder.record()
        
        //Navigation Controller
        self.navigationController?.title = "Confrontation Naming"
        
        //GUI Design
        let W = screenSize.width
        let H = screenSize.height
        //let buttonW = 0.2 * W
        //let buttonH = buttonW / sqrt(3)
        let textW = 0.8 * W
        let textH = textW / 8.0
        let picW = W * 0.6
        let picH = picW
        
        hintButton.frame = CGRect(x: W * 0.42, y: H * 0.8, width: W * 0.15, height: W * 0.15)
        nextButtonOutlet.frame = CGRect(x: W * 0.8, y: H * 0.8, width: W * 0.15, height: W * 0.15)
        instructionsOutlet.frame = CGRect(x: 0.1 * W, y: 0.1*H, width: textW, height: textH)
        imageToName.frame = CGRect(x: 0.2 * W, y: 0.2*H, width: picW, height: picH)
        homeButton.frame = CGRect(x: W*0.8, y: 15, width: W*0.15, height: W*0.15)
        //Generate Random Picture
        picNum = Int(arc4random_uniform(UInt32(numSteps)))
        
        initArr[0] = picNum
        
        // Creates a random picture filename with picture name and phonetic queue
        imageToName.image = UIImage(named:"PictureIdentification_\(picNum).jpg")
        print("Current Picture: \(filenames[picNum])")
        
        // Extacts phonetic queue
        queueString = findCue(filenames[picNum])
        print("Cue: \(queueString)")
        
        print("Image currently showing: picture\(picNum)\(filenames[picNum]).jpg")
        print("CurStep: \(curStep)")
        
        if (createFileSuccess == true) {
            print("Saving File")
            TextFileCollection().saveData("Question: picture\(picNum)\(filenames[picNum]).jpg \r\n Saved File: \(filename).m4a \r\n", saveFolder: currFolder, theUser: currUserName, theSess: currSess)
        }
        
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        let currFolder:URL = getCacheDirectory().appendingPathComponent(moduleFolderName)
        TextFileCollection().saveData("End of naming module \r\n", saveFolder: currFolder, theUser: currUserName, theSess: currSess)
        let backToMenu = segue.destination as! MainMenu
        backToMenu.namingAudioFiles = self.audioFiles
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    //@IBAction func Record(sender: UIButton) {
      //  if sender.titleLabel?.text == "Record" {
        //    setupRecorder()
        //    recorder.record()
        //    sender.setTitle("Stop", forState: .Normal)
        //    playButton.enabled = false
      //  } else {
      //      recorder.stop()
      //      sender.setTitle("Record", forState: .Normal)
      //      playButton.enabled = false
      //  }
        
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
    
    @IBAction func Hint(_ sender: UIButton) {
        phoneticQueue = AVSpeechUtterance(string: queueString)
        phoneticQueue.rate = 0.6
        synth.speak(phoneticQueue)
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
    
    // Recorder Setup
    func setupRecorder(_ saveFolder: URL) {
        
        recordingSession = AVAudioSession.sharedInstance()
        
        filename = generateFileName(module) + ".m4a"
        
        let recordSettings = [
            AVFormatIDKey: NSNumber(value: kAudioFormatAppleLossless as UInt32),
            AVEncoderAudioQualityKey : AVAudioQuality.max.rawValue,
            AVEncoderBitRateKey : 320000,
            AVNumberOfChannelsKey: 2,
            AVSampleRateKey : 44100.0
        ] as [String : Any]
//        AVAudioSession.sharedInstance().requestRecordPermission({[unowned self](granted: Bool) -> Void in
//            if granted {
//                print("Permission Granted")
//                try self.recordingSession.setCategory(AVAudioSessionCategoryPlayAndRecord)
//                try self.recordingSession.setActive(true)
//                
//            } else {
//                print("Failed to record")
//            }
//        })
        
        do {
            recorder = try AVAudioRecorder(url: getFileURL(saveFolder), settings: recordSettings as [String : AnyObject])
            self.recorder.delegate = self
            self.recorder.prepareToRecord()
        } catch {
            print("something wrong!")
        }
    }
    
    func getFileURL(_ saveFolder: URL) -> URL {
        let path = saveFolder.appendingPathComponent(filename)
        print("GetFileURL() output -> " + filename)
        return path
    }
    
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
    
    func findCue(_ someName: String) -> String {
        var cue = someName
        var anIndex = someName.characters.index(of: "_")
        while anIndex != nil {
            cue = cue.substring(from: anIndex!)
            cue = String(cue.characters.dropFirst())
            anIndex = cue.characters.index(of: "_")
        }
        return cue
    }
    
    func generateFileName(_ module: String) -> String {
        let todaysDate:Date = Date()
        let dateFormatter:DateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MM-dd-yy_HH:mm:ss"
        let DateInFormat:String = dateFormatter.string(from: todaysDate)
        return module + "_" + DateInFormat
    }
    
 //   func preparePlayer() {
 //       do {
 //           player = try AVAudioPlayer(contentsOfURL: getFileURL())
 //           player.delegate = self
 //           player.prepareToPlay()
 //           player.volume = 1.0
 //       } catch {
 //           print("something wrong")
 //       }
 //   }
    
 //   func audioRecorderDidFinishRecording(recorder: AVAudioRecorder, successfully flag: Bool) {
 //       playButton.enabled = true
 //       playButton.setTitle("Play", forState: .Normal)
 //   }
    
 //   func audioPlayerDidFinishPlaying(player: AVAudioPlayer, successfully flag: Bool) {
 //       recordButton.enabled = true
 //       playButton.setTitle("Play", forState: .Normal)
 //   }
    
    
    // take everything after this
    
    
    func getCacheDirectory() -> URL {
        let paths = fm.urls(for: .documentDirectory, in: .userDomainMask)[0]
        
        return paths
    }
    /*
    
    func getFilesInDirectory(inputDirectory: NSURL) -> [NSURL] {
        let items = try! fm.contentsOfDirectoryAtURL(inputDirectory, includingPropertiesForKeys: nil, options: .SkipsSubdirectoryDescendants) as [NSURL]
        var objects = [NSURL] ()
        for item in items {
            if (item.pathExtension == "txt") {
                objects.append(item)
            }
        }
        // print("List of Objects in directory \(objects)")
        return objects
    }
    
    func createFile(header: String, saveFolder: NSURL) -> Bool {
        let currFile:String = "\(currUser)_\(currSess)"
        let savePath: NSURL = saveFolder.URLByAppendingPathComponent(currFile + ".txt")
        let listOfFiles = getFilesInDirectory(saveFolder)
        var fileExists:Bool = false
        for file in listOfFiles {
            if (file.pathComponents![1] == currFile) {
                fileExists = true
            }
            
        }
        if (fileExists == true) {
            return false
            // otherwise create the file and save the data
        } else {
            do {
                try header.writeToURL(savePath, atomically: true, encoding: NSUTF8StringEncoding)
            } catch let error as NSError{
                print(error.description)
            }
            return true
        }
    }
    
    func saveData(dataToBeSaved: String, saveFolder: NSURL) {
        let currFile: String = "\(currUser)_\(currSess)"
        let savePath: NSURL = saveFolder.URLByAppendingPathComponent(currFile + ".txt")
        let listOfFiles = getFilesInDirectory(saveFolder)
        var fileExists:Bool = false
        for file in listOfFiles {
            if (file.pathComponents?[1] == currFile) {
                print("File already exists")
                fileExists = true
            }
            
        }
            do {
                var curText = try String(contentsOfURL: savePath, encoding: NSUTF8StringEncoding)
                curText = curText + dataToBeSaved
                print("Data Successfully Read")
                try curText.writeToURL(savePath, atomically: true, encoding: NSUTF8StringEncoding)
                print("Data Successfully Saved")
            } catch let error as NSError {
                print(error.description)
            }
        print(savePath)
    }
    
    func createFolder(folderName: String) -> Bool{
        let listOfFiles = getFilesInDirectory(getCacheDirectory())
        let folderURL = getCacheDirectory().URLByAppendingPathComponent(folderName)
        var folderCreation:Bool!
        for folder in listOfFiles {
            if (folderURL == folder) {
                folderCreation = false
            } else {
                do {
                    try fm.createDirectoryAtURL(folderURL, withIntermediateDirectories: true, attributes: nil)
                    folderCreation = true
                } catch _ {
                    folderCreation = false
                }
            }
        }
        return folderCreation
    }
    */
}
