module.exports = function(grunt){

    grunt.initConfig({
        transport : {
            options : {
                format : 'src/{{filename}}'  //在压缩文件中生成的id的格式
            },
            application : {
                files : {
                    '.build' : ['application.js','util.js']   //将application.js、util.js合并且提取依赖，生成id，之后放在.build目录下
                }
            }
        },
        concat : {
            main : {
                options : {
                    relative : true
                },
                files : {
                    'dist/application.js' : ['.build/application.js'],  // 合并.build/application.js文件到dist/application.js中
                    'dist/application-debug.js' : ['.build/application-debug.js']
                }
            }
        },
        uglify : {
            main : {
                files : {
                    'dist/application.js' : ['dist/application.js'] //对dist/application.js进行压缩，之后存入dist/application.js文件
                }
            }
        },
        clean : {
            build : ['.build'] //清除.build文件
        }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('build',['transport','concat','uglify','clean'])
};