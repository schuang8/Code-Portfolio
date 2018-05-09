#include "kglfx/fileIO_tools/fileIO.h"

#include <iostream>
#include <string>
#include <vector>

#include "gtest/gtest.h"
#include "kglfx/config/kglfx_test.h"

#include <fstream>
#include <cstdio>
#ifdef _WIN32
#include <Windows.h>
#include <filesystem>
#elif defined(__unix__)
#include <experimental/filesystem>
#endif


namespace fs = std::experimental::filesystem;


/**RAII-style (aka "scoped") temporary directory.
 * When the object goes out of scope, the directory and its contents are deleted.
 * The name of the directory is the name of the test calling this function.
 */
class TemporaryLocalDir
{
public:
    TemporaryLocalDir(std::string name) : path("./" + name)
    {
        fs::create_directory(path);
    };
    TemporaryLocalDir(fs::path name) : path(fs::path("./") / name)
    {
        fs::create_directory(path);
    };
    ~TemporaryLocalDir()
    {
        std::error_code ec;
        //Using non-throwing version of remove_all because we're in a destructor
        std::uintmax_t result = fs::remove_all(path, ec);
        if (result == -1)
            std::cerr << "could not remove directory " << path.string() <<"\n";
    };
    fs::path getPath()
    {
        return path;
    };
private:
    fs::path path;
};

std::string getTestCaseName()
{
    auto info = ::testing::UnitTest::GetInstance()->current_test_info();
    return std::string(info->name()) + std::string(info->test_case_name());
}

void createEmptyFile(fs::path path)
{
    std::FILE *file = fopen(path.string().c_str(), "w");//is there nothing in C++ to do that?
    fclose(file);
    ASSERT_TRUE(fs::exists(path));
}

TEST(FileIOTools, findFontFilePath0000loadsFontFromCurrentDir)
{
    kglfx::fileIO::FileIOTools fontLoader;
    fs::path inFont = "./fonts/arial.ttf";
    std::string returnPath = fontLoader.findFontFilePath("arial.ttf");
    fs::path fsReturnPath = returnPath;
    EXPECT_TRUE(fs::equivalent(fsReturnPath, inFont));
}

TEST(FileIOTools, findFontFilePath0000correctlyHandlesLeadingDotSlash)
{
    kglfx::fileIO::FileIOTools fontLoader;

    fs::path path1 = "./arial.ttf";
    std::string returnPath = fontLoader.findFontFilePath(path1);
    fs::path fsReturnPath = returnPath;
    EXPECT_EQ(fsReturnPath.filename().string(), path1.filename().string());

    fs::path path2 = "././arial.ttf";
    returnPath = fontLoader.findFontFilePath(path2);
    fs::path fsReturnPath2 = returnPath;
    EXPECT_TRUE(fs::equivalent(fsReturnPath2, fsReturnPath));
}

TEST(FileIOTools, addSearchPath0000works)
{
    kglfx::fileIO::FileIOTools fontLoader;
    TemporaryLocalDir dir(getTestCaseName());
    fontLoader.addSearchPath(dir.getPath());
    fs::path dummyFile = dir.getPath() / "dummyFile.txt";
    createEmptyFile(dummyFile);
    fs::path fontPath = dummyFile;
    std::string returnPath = fontLoader.findFontFilePath("dummyFile.txt");
    EXPECT_TRUE(fs::equivalent(fontPath, fs::path(returnPath)));
}

TEST(FileIOTools, findFontFilePath00loadsFontFromSystemDir)
{
    kglfx::fileIO::FileIOTools fontLoader;
#ifdef _WIN32
    fs::path fontPath = "C:\\WINDOWS\\Fonts\\wingding.ttf";
    std::string returnPath = fontLoader.findFontFilePath("wingding.ttf");
#elif defined(__unix__)
    fs::path fontDirectory = "/usr/share/fonts/truetype/liberation";
    fs::path fontPath = fontDirectory / fs::path("LiberationSans-BoldItalic.ttf");
    std::string returnPath = fontLoader.findFontFilePath("LiberationSans-BoldItalic.ttf");
#else
    FAIL(); //We don't handle other sytems for the moment
#endif
    EXPECT_TRUE(fs::equivalent(fontPath, fs::path(returnPath)));
}

TEST(FileIOTools, findFontFilePath0000prefersLocalDirToSystemDir)
{
    kglfx::fileIO::FileIOTools fontLoader;
#ifdef _WIN32
    fs::path localPath{".\\fonts\\Arial.ttf"};
    fs::path systemPath = "C:\\WINDOWS\\Fonts\\Arial.ttf";
#elif defined(__unix__)
    fs::path systemPath = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc";
    fs::path localPath{"./fonts/wqy-microhei.ttc"};
#else
    FAIL(); //Not implemented yet
#endif
    std::string returnPath = fontLoader.findFontFilePath(localPath);

    EXPECT_TRUE(fs::equivalent(localPath, fontLoader.getFoundFilePath()));
}

TEST(FileIOTools, findFontFilePath0000acceptsArgumentWithLeadingDirectories)
{
    kglfx::fileIO::FileIOTools fontLoader;
    TemporaryLocalDir dir(getTestCaseName());
    fs::path fileName("dummyFont");
    fs::path fontPath = dir.getPath() / fileName;
    createEmptyFile(fontPath);
    fontLoader.addSearchPath("./");
    //the argument fontPath is a path with directories
    std::string returnPath = fontLoader.findFontFilePath(fontPath);
    EXPECT_TRUE(fs::equivalent(fontPath, fs::path(returnPath)));
}

TEST(FileIOTools, findFontFilePath0000returnsDefaultFontIfArgDoesNotExist)
{
    kglfx::fileIO::FileIOTools fontLoader;
    std::string returnPath = fontLoader.findFontFilePath("inexistent.ttf");

    EXPECT_EQ(fontLoader.getDefaultFontName(), fs::path(returnPath).filename().string());
}

TEST(FileIOTools, findFontFilePath0000returnsDefaultFontIfEmptyArg)
{
    kglfx::fileIO::FileIOTools fontLoader;
    std::string returnPath = fontLoader.findFontFilePath("");

    EXPECT_EQ(fontLoader.getDefaultFontName(), fs::path(returnPath).filename().string());
}

TEST(FileIOTools, findFontFilePath0000returnsDefaultFontIfArgIsADirectory)
{
    kglfx::fileIO::FileIOTools fontLoader;
    TemporaryLocalDir dir(getTestCaseName());
    std::string returnPath = fontLoader.findFontFilePath(dir.getPath());

    EXPECT_EQ(fontLoader.getDefaultFontName(), fs::path(returnPath).filename().string());
}

TEST(FileIOTools, findFontFilePath0000returnsDefaultFontIfInvalidArg)
{
    kglfx::fileIO::FileIOTools fontLoader;
    TemporaryLocalDir dir(getTestCaseName());
    fontLoader.addSearchPath(dir.getPath());
    fs::path dummyFile = dir.getPath() / "!@#$%^&*()_+{}[]|\<>?,./:;' ";

    fs::path fontPath = dummyFile;
    std::string returnPath = fontLoader.findFontFilePath(fontPath.string());
    EXPECT_EQ(fontLoader.getDefaultFontPath(), returnPath);
}

TEST(FileIOTools, findFontFilePath0000searchesDirectoriesRecursively)
{
    kglfx::fileIO::FileIOTools fontLoader;
    TemporaryLocalDir dir(getTestCaseName());
    fs::path fileName("dummyFont");
    fs::path fontPath = dir.getPath() / fileName;
    fontLoader.addSearchPath("./");
    createEmptyFile(fontPath);
    //we specify the font but not the directory
    std::string returnPath = fontLoader.findFontFilePath(fileName);
    EXPECT_EQ(fontPath.string(), returnPath);
}

TEST(FileIOTools, findFontFilePath0000loadsDefaultFontIfArgNotFound)
{
    kglfx::fileIO::FileIOTools fontLoader;

    std::string returnPath = fontLoader.findFontFilePath("NotARealFont");
    fs::path fsReturnPath = returnPath;
    fs::path expectName = fontLoader.getDefaultFontName();

    EXPECT_EQ(expectName.filename().string(), fsReturnPath.filename().string());
}

TEST(FileIOTools, NonAsciiPathsAreHandledCorrectly)
{
#if 1
    std::string dirName = "你好";
    TemporaryLocalDir dir(dirName);
#else
    //TODO: This does not work on Windows
    std::string dirName = "\u4f60\u597d";
    TemporaryLocalDir dir(fs::u8path(dirName));
#endif
    fs::path fontPath = dir.getPath();
    fontPath /= fs::path("dummyFile.ttf");
    createEmptyFile(fontPath);

    kglfx::fileIO::FileIOTools fontLoader;
    std::string returnPath = fontLoader.findFontFilePath(fontPath);
    EXPECT_TRUE(fs::equivalent(fontPath, fs::path(returnPath)));
}

TEST(FileIOTools, DISABLED_findFontFilePath0000doesNotNeedExtension)
{
    /*Some fonts have extension .ttf and some other have .ttc
    It would be nice if we could specify the font name ("Arial")
    instead of the file name ("Arial.ttf)"*/
    FAIL(); //TODO
}

TEST(FileIOTools, DISABLED_findFontFilePath0000isNotCaseSensitive)
{
    /*Windows uses capital letters on their font files.
    Luckily windows filesystem is not case sensitive.
    But maybe it would be useful not to require case sensitivity...*/
    FAIL(); //TODO
}

TEST(FileIOTools, DISABLED_findFontFilePath0000handlesArgumentWithRoot)
{
    /*if the font provided is e.g. "/foo/bar/font.ttf",
    or, in other terms, an absolute path is provided,
    it should be handled correctly.*/

    /*At the moment, does not work.
    How can we make the difference between a real absolute path like C:\foo/bar
    and some grbg like:
    "!@#$%^&*()_+{}[]|\<>?,./:;' "
    ?
    */
    FAIL(); //TODO
}

int main(int argc, char* argv[])
{
    testing::InitGoogleTest(&argc, argv);

    int result = kglfx::test::Config().RUN_ALL_TESTS();
    std::cout << "result from " __FILE__ << " is: " << result << std::endl;

    return result;
}
