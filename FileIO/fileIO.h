#include <string>
#include <map>

#if defined(_WIN32)
#include <filesystem>
#elif defined(__unix__)
#include <experimental/filesystem>
#endif

namespace fs = std::experimental::filesystem;

namespace fileIO
{
    class FileIOTools
    {
    public:

        /**
        * Default constructor, loads a default set of file paths to be searched
        # Default Paths: C:\Windows\Fonts\, /etc/fonts/fonts.conf, .\bin
        * @example findFontFilePath("arial.ttf"); Will return C:\Windows\Fonts\arial.ttf
        * @param   fs::path searchPath - specifc search path
        */
        FileIOTools();

        /**
        * Add a specific file path to be searched
        * @example findFontFilePath("arial.ttf"); Will return C:\Windows\Fonts\arial.ttf
        * @param   fs::path searchPath - specifc search path
        */
        void addSearchPath(fs::path searchPath);

        /**
         * Given a font name with the extention, finds the full file path
         * @example findFontFilePath("arial.ttf"); Will return C:\Windows\Fonts\arial.ttf
         * @param   fs::path fontName
         * @return  std::string
         */
        std::string findFontFilePath(fs::path fontName);

        std::string getFoundFileName();

        fs::path getFoundFilePath();

        /**
         * Returns the path to the default font
         */
        std::string getDefaultFontPath();

        /**
         * Return the name of the default font
         */
        std::string getDefaultFontName();

        ~FileIOTools();

        bool isAReadableFile(fs::path file);

    private:
        /*Returns true if the path for this font name is already cached*/
        bool cached(std::string);
        bool elementIsADirectory(const fs::directory_entry&);
        std::string recordEntry(fs::path path, fs::path fontName);
        void loadSystemPaths();
        
        std::vector<fs::path> m_fileSearchPaths;
        fs::path              m_foundFilePath;
        const fs::path defaultFontPath{"./fonts/roboto.ttf"};
        std::map<std::string, fs::path> cache;
    };
}
