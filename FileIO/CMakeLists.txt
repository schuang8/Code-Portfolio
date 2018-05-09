##########################

set(SRC
  fileIO.cpp
  fileIO.h
        )

set(X kglfx_FileIOTools)
add_library( ${X}  ${KVIZ_BUILD_LIB_TYPE}  ${SRC} )


target_link_libraries(${X}
     ${DEFAULT_LIBRARIES}
        )
if (NOT WIN32)
    target_link_libraries(${X} stdc++fs)
endif()




set(Y  test_fileIOTools)
add_executable(${Y} ${Y}.cpp)
target_link_libraries(${Y}  ${X}  kglfx_Testing  CONAN_PKG::gtest)
add_test_xml(${Y})
##########################
