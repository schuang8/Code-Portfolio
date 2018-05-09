#include "fileIO.h"

#include <string>
#include <vector>
#include <iostream>

#if defined(_WIN32)
#include <Windows.h>
#elif defined(__unix__)
#include <fstream>
#include <unistd.h>
#endif

using namespace fileIO;

FileIOTools::FileIOTools()
{
    m_fileSearchPaths.push_back("./fonts/");
    m_fileSearchPaths.push_back("./");
    loadSystemPaths();
}

void FileIOTools::loadSystemPaths()
{
#ifdef _WIN32
    const unsigned int bufferSize = MAX_PATH;
    char winPath[bufferSize];
    //FIXME: How does this function handle non-ASCII paths?
    auto retval = ::GetWindowsDirectoryA(winPath, bufferSize);
    if (retval == 0)
        throw std::runtime_error("Could not get location of Windows directory");
    if (retval >= bufferSize)
        throw std::runtime_error("Path to Windows directory too long");
    std::string path(winPath);
    path += "/Fonts/";
    m_fileSearchPaths.push_back(path);

#elif defined(__unix__)
    std::string line;
    std::ifstream hFile("/etc/fonts/fonts.conf");

    if (!hFile.is_open())
        return;

    while (std::getline(hFile, line))
    {
        auto found = line.find("<dir>/");
        if (found == std::string::npos)
            continue;
        auto endMkr = line.find("</dir>");
        const std::string::size_type markupLength = 5; //the length of "<dir>"
        auto fontConfDir = line.substr(found + markupLength, endMkr - (found + markupLength));
        m_fileSearchPaths.push_back(fs::path(fontConfDir));
    }
#else
    static_assert(false,"Did not expect this operating system!");
#endif
}

void FileIOTools::addSearchPath(fs::path searchPath)
{
    auto first = m_fileSearchPaths.begin();
    m_fileSearchPaths.insert(first, searchPath);
}

std::string FileIOTools::findFontFilePath(fs::path fontName)
{
    if (cached(fontName.string()))
        return cache[fontName.string()].string();

    if (fontName.has_root_path())
    {
        /*At the moment, does not accept fonts with a root path.
        FIXME: make it happen*/
        return recordEntry(defaultFontPath, fontName);
    }
    fs::path filePath;
    for (fs::path topDir : m_fileSearchPaths)
    {
        filePath = topDir / fontName;
        if (isAReadableFile(filePath))
        {
            return recordEntry(filePath, fontName);
        }

        for (const auto& elem : fs::recursive_directory_iterator(topDir))
        {
            if (!elementIsADirectory(elem))
                continue;
            filePath = elem.path() / fontName;
            if (isAReadableFile(filePath))
                return recordEntry(filePath, fontName);
        }
    }

    std::cerr << "Font file not found: " << fontName.string() << "\n";
    std::cerr << "loading default font." << std::endl;
    return recordEntry(defaultFontPath, fontName);
}

std::string FileIOTools::recordEntry(fs::path path, fs::path fontName)
{
    m_foundFilePath = path;
    cache[fontName.string()] = path;
    return m_foundFilePath.string();
}

bool FileIOTools::elementIsADirectory(const fs::directory_entry& elem)
{
    return elem.status().type() == fs::file_status(fs::file_type::directory).type();
}

std::string FileIOTools::getFoundFileName()
{
    return m_foundFilePath.filename().string();
}

fs::path FileIOTools::getFoundFilePath()
{
    return m_foundFilePath;
}

FileIOTools::~FileIOTools()
{
}

bool FileIOTools::isAReadableFile(fs::path path)
{
    fs::directory_entry entry(path);
    if (fs::status(path).type() != fs::file_status(fs::file_type::regular).type())
        return false;

    /*Todo: improve this...*/
    fs::perms perms = entry.status().permissions();
    fs::perms readable = fs::perms::group_read & fs::perms::others_read & fs::perms::others_read;
    if ((perms & readable) != readable)
        return false;

    return true;
}

std::string FileIOTools::getDefaultFontPath()
{
    return defaultFontPath.string();
}

std::string FileIOTools::getDefaultFontName()
{
    fs::path path(defaultFontPath);
    return path.filename().string();
}

bool FileIOTools::cached(std::string str)
{
    return cache.count(str) ? true : false;
}