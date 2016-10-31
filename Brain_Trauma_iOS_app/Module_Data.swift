//
//  Module_Data.swift
//  B.T.A.P.
//
//  Created by Orlando G. Rodriguez on 11/1/15.
//  Copyright © 2015 Vertically Integrated Projects. All rights reserved.
//

import UIKit
import Foundation
import SQLite

class Module_Data: UIViewController, UITableViewDelegate, UITableViewDataSource {  // Table view controller
    
    let cellIdentifier = "CellIdentifier"
    
    var sceneDescriptionData:[URL]!
    var sceneDescriptionAudio:[URL]!
    var samData:[URL]!
    var namingData:[URL]!
    var namingAudio:[URL]!
    var picIDData:[URL]!
    var fillInBlankData:[URL]!
    var fillInBlankAudio:[URL]!
    var yesnoData:[URL]!
    var repetitionData:[URL]!
    var repetitionAudio:[URL]!
    
    var listOfFiles:[URL]!
    let docDir:URL = TextFileCollection().getCacheDirectory() as URL
    let namingFolder:URL = TextFileCollection().getCacheDirectory().appendingPathComponent("Naming Module Data")
    let YesNoFolder:URL = TextFileCollection().getCacheDirectory().appendingPathComponent("YesNo Module Data")
    let fillInBlankFolder:URL = TextFileCollection().getCacheDirectory().appendingPathComponent("Fill in the Blank Module Data")
    let SAMFolder:URL = TextFileCollection().getCacheDirectory().appendingPathComponent("SAM Module Data")
    let repetitionFolder:URL = TextFileCollection().getCacheDirectory().appendingPathComponent("Repetition Module Data")
    let sceneDescriptionFolder:URL = TextFileCollection().getCacheDirectory().appendingPathComponent("Scene Description Module Data")
    let picIDFolder:URL = TextFileCollection().getCacheDirectory().appendingPathComponent("Picture Identification Module Data")
    
    @IBOutlet var tableViewData: UITableView!
    
    //
    // Counts the current total number of rows
    func numberOfSections(in tableView: UITableView) -> Int {
        
        
        let itemsInDir:[URL] = TextFileCollection().getFilesInDirectory(docDir)
        var totalRows = 0
        for item in itemsInDir {
            if item.path == namingFolder.path {
                let namingFiles:[URL] = TextFileCollection().getFilesInDirectory(namingFolder)
                for file in namingFiles {
                    let theFile:String = file.absoluteString
                    if theFile.hasSuffix(".txt") {
                        namingData.append(file)
                    } else if theFile.hasSuffix(".m4a") {
                        namingAudio.append(file)
                    }
                }
            } else if YesNoFolder.path == item.path {
                let YesNoFiles:[URL] = TextFileCollection().getFilesInDirectory(YesNoFolder)
                for file in YesNoFiles {
                    let theFile:String = file.absoluteString
                    if theFile.hasSuffix(".txt") {
                        yesnoData.append(file)
                    }
                }
            } else if fillInBlankFolder.path == item.path {
                let fillInBlankFiles:[URL] = TextFileCollection().getFilesInDirectory(fillInBlankFolder)
                for file in fillInBlankFiles {
                    let theFile:String = file.absoluteString
                    if theFile.hasSuffix(".txt") {
                        fillInBlankData.append(file)
                    } else if theFile.hasSuffix(".m4a") {
                        fillInBlankAudio.append(file)
                    }
                }
            } else if SAMFolder.path == item.path {
                let SAMFiles:[URL] = TextFileCollection().getFilesInDirectory(SAMFolder)
                for file in SAMFiles {
                    let theFile:String = file.absoluteString
                    if theFile.hasSuffix(".txt") {
                        samData.append(file)
                    }
                }
            } else if repetitionFolder.path == item.path {
                let repetitionFiles:[URL] = TextFileCollection().getFilesInDirectory(repetitionFolder)
                for file in repetitionFiles {
                    let theFile:String = file.absoluteString
                    if theFile.hasSuffix(".txt") {
                        repetitionData.append(file)
                    } else if theFile.hasSuffix(".m4a") {
                        repetitionAudio.append(file)
                    }
                }
            } else if sceneDescriptionFolder.path == item.path {
                let sceneDescriptionFiles:[URL] = TextFileCollection().getFilesInDirectory(sceneDescriptionFolder)
                for file in sceneDescriptionFiles {
                    let theFile:String = file.absoluteString
                    if theFile.hasSuffix(".txt") {
                        sceneDescriptionData.append(file)
                    } else if theFile.hasSuffix(".m4a") {
                        sceneDescriptionAudio.append(file)
                    }
                }
            } else if picIDFolder.path == item.path {
                let picIDFiles:[URL] = TextFileCollection().getFilesInDirectory(picIDFolder)
                for file in picIDFiles {
                    let theFile:String = file.absoluteString
                    if theFile.hasSuffix(".txt") {
                        picIDData.append(file)
                    }
                }
            }
            totalRows = 7
        }
        
        
        return totalRows
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        
        switch section {
        case 0: return TextFileCollection().getFilesInDirectory(namingFolder).count
        case 1: return TextFileCollection().getFilesInDirectory(YesNoFolder).count
        case 2: return TextFileCollection().getFilesInDirectory(fillInBlankFolder).count
        case 3: return TextFileCollection().getFilesInDirectory(SAMFolder).count
        case 4: return TextFileCollection().getFilesInDirectory(repetitionFolder).count
        case 5: return TextFileCollection().getFilesInDirectory(sceneDescriptionFolder).count
        case 6: return TextFileCollection().getFilesInDirectory(picIDFolder).count
        default: return 0
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell:UITableViewCell = self.tableViewData.dequeueReusableCell(withIdentifier: cellIdentifier, for: indexPath) as UITableViewCell
        
        switch (indexPath as NSIndexPath).row {
        case 0: let title = sceneDescriptionData[(indexPath as NSIndexPath).row].path
        cell.textLabel?.text = title
        case 1: let title = samData[(indexPath as NSIndexPath).row].path
        cell.textLabel?.text = title
        case 2: let title = namingData[(indexPath as NSIndexPath).row].path
        cell.textLabel?.text = title
        case 3: let title = picIDData[(indexPath as NSIndexPath).row].path
        // let label = cell.contentView.viewWithTag(10) as? UILabel
        cell.textLabel?.text = title
        case 4: let title = fillInBlankData[(indexPath as NSIndexPath).row].path
        // let label = cell.contentView.viewWithTag(10) as? UILabel
        cell.textLabel?.text = title
        case 5: let title = yesnoData[(indexPath as NSIndexPath).row].path
        // let label = cell.contentView.viewWithTag(10) as? UILabel
        cell.textLabel?.text = title
        case 6: let title = repetitionData[(indexPath as NSIndexPath).row].path
        // let label = cell.contentView.viewWithTag(10) as? UILabel
        cell.textLabel?.text = title
        default: break
        }
        return cell
    }
    
        func tableView(_ tableView: UITableView, titleForHeaderInSection section: Int) -> String? {
            switch section {
            case 0: return "Scene Description"
            case 1: return "Self Assessment Mannequin"
            case 2: return "Naming"
            case 3: return "Picture Identification"
            case 4: return "Fill in Blank"
            case 5: return "Yes or No"
            case 6: return "Repetition"
            default: return ""
            }
        }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationController?.title = "Data"
        
        self.tableViewData.register(UITableViewCell.self, forCellReuseIdentifier: cellIdentifier)
        tableViewData.dataSource = self
        tableViewData.delegate = self
//        namingFolder = docDir.URLByAppendingPathComponent("Naming Module Data")
//        YesNoFolder = docDir.URLByAppendingPathComponent("YesNo Module Data")
//        fillInBlankFolder = docDir.URLByAppendingPathComponent("Fill in the Blank Module Data")
//        SAMFolder = docDir.URLByAppendingPathComponent("SAM Module Data")
//        repetitionFolder = docDir.URLByAppendingPathComponent("Repetition Module Data")
//        sceneDescriptionFolder = docDir.URLByAppendingPathComponent("Scene Description Module Data")
//        picIDFolder = docDir.URLByAppendingPathComponent("Picture Identification Module Data")
        
        // getListOfFiles()
        
        // Quality Control
        //        var i = 0
        //        for item in sceneDescriptionData {
        //            if item.characters.count == 28 && sceneDescriptionData.count > 0 {
        //                sceneDescriptionData.removeAtIndex(i)
        //            }
        //        }
        //        i = 0
        //        for item in namingData {
        //            if item.characters.count != 28 && namingData.count > 0 {
        //                print("Attempting to remove \(namingData[i])")
        //                namingData.removeAtIndex(i)
        //            }
        //            i++
        //        }
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        navigationItem.title = nil
    }
    
    fileprivate func getListOfFiles () {
        let itemsInDir:[URL] = TextFileCollection().getFilesInDirectory(docDir)
        for item in itemsInDir {
        if item.path == namingFolder.path {
            let namingFiles:[URL] = TextFileCollection().getFilesInDirectory(namingFolder)
            for file in namingFiles {
                let theFile:String = file.absoluteString
                if theFile.hasSuffix(".txt") {
                    namingData.append(file)
                } else if theFile.hasSuffix(".m4a") {
                    namingAudio.append(file)
                }
            }
        } else if YesNoFolder.path == item.path {
            let YesNoFiles:[URL] = TextFileCollection().getFilesInDirectory(YesNoFolder)
            for file in YesNoFiles {
                let theFile:String = file.absoluteString
                if theFile.hasSuffix(".txt") {
                    yesnoData.append(file)
                }
            }
        } else if fillInBlankFolder.path == item.path {
            let fillInBlankFiles:[URL] = TextFileCollection().getFilesInDirectory(fillInBlankFolder)
            for file in fillInBlankFiles {
                let theFile:String = file.absoluteString
                if theFile.hasSuffix(".txt") {
                    fillInBlankData.append(file)
                } else if theFile.hasSuffix(".m4a") {
                    fillInBlankAudio.append(file)
                }
            }
        } else if SAMFolder.path == item.path {
            let SAMFiles:[URL] = TextFileCollection().getFilesInDirectory(SAMFolder)
            for file in SAMFiles {
                let theFile:String = file.absoluteString
                if theFile.hasSuffix(".txt") {
                    samData.append(file)
                }
            }
        } else if repetitionFolder.path == item.path {
            let repetitionFiles:[URL] = TextFileCollection().getFilesInDirectory(repetitionFolder)
            for file in repetitionFiles {
                let theFile:String = file.absoluteString
                if theFile.hasSuffix(".txt") {
                    repetitionData.append(file)
                } else if theFile.hasSuffix(".m4a") {
                    repetitionAudio.append(file)
                }
            }
        } else if sceneDescriptionFolder.path == item.path {
            let sceneDescriptionFiles:[URL] = TextFileCollection().getFilesInDirectory(sceneDescriptionFolder)
            for file in sceneDescriptionFiles {
                let theFile:String = file.absoluteString
                if theFile.hasSuffix(".txt") {
                    sceneDescriptionData.append(file)
                } else if theFile.hasSuffix(".m4a") {
                    sceneDescriptionAudio.append(file)
                }
            }
        } else if picIDFolder.path == item.path {
            let picIDFiles:[URL] = TextFileCollection().getFilesInDirectory(picIDFolder)
            for file in picIDFiles {
                let theFile:String = file.absoluteString
                if theFile.hasSuffix(".txt") {
                    picIDData.append(file)
                }
            }
        }
        }
    }
}
