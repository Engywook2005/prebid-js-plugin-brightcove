var path = require('path');
require('eslint-loader');
var StringReplacePlugin = require('string-replace-webpack-plugin');

var GLOBAL_VAR_NAME = 'bc_plugin_pbjs'
var MODE_DEV = 'development';
var MODE_PROD = 'production';

module.exports = function (mode) {

    console.log('Exporting Common Config > mode: ' + mode);
/*
    if (mode === 'development') {
        // console.log('Do development tasks...');
    } else if (mode === 'production') {
        // console.log('Do production tasks...');
    } else if (mode === 'none') {
        // console.log('*** WARNING: Webpack MODE set to NONE');
    } else {
        // console.log('*** WARNING: Webpack MODE NOT SET');
    }
*/
    var varName;

    var config = {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    enforce: 'pre',
                    include: [
                        path.resolve(__dirname, 'src'),
                        path.resolve(__dirname, 'test'),
                    ],
                    loader: 'eslint-loader',
                    options: {
                        emitError: true,
                        failOnError: true,
                    }
                },
                {
                    test: /\.js$/,
                    enforce: 'pre',
                    include: [
                        path.resolve(__dirname, 'src')
                    ],
                    loader: StringReplacePlugin.replace({
                        replacements: [
                            {
                                pattern: /\$\$PREBID_GLOBAL\$\$/g,
                                replacement: function (match, p1, offset, string) {
                                    return GLOBAL_VAR_NAME;
                                }
                            },
                            {
                                /* Any '</script>' (closing stript tags within string literals)
                                 * that exist in the code must be escaped - or they may be
                                 * misinterpreted by browsers as closing the parent script tag
                                 * that this code is embedded within on the parent html page. */
                                pattern: /<\/script>/gi,
                                replacement: function (match, p1, offset, string) {
                                    // console.log('####################### STRING REPLACE PLUGIN >> match: ' + match + ' --- p1: ' + p1 + /* ' --- offset: ' + offset + */' --- string: ' + string);
                                    console.warn('*******************************************************************************************');
                                    console.warn('*** WARNING: "<\/script>" string found in code - THIS SHOULD BE ESCAPED to: "<\\/script>" ***');
                                    console.warn('*******************************************************************************************');
                                    return '<\\/script>';
                                }
                            },
                            {
                                /* Remove any debugger statements for a production build */
                                pattern: /debugger;|debugger/g,
                                replacement: function (match, p1, offset, string) {
                                    // console.log('####################### STRING REPLACE PLUGIN >> match: ' + match + ' --- p1: ' + p1 + /* ' --- offset: ' + offset + */' --- string: ' + string);
                                    if (mode === MODE_PROD) {
                                        throw new Error('*** ERROR: HEY YOU! REMOVE THE debugger; STATEMENT FROM YOUR CODE! ***');
                                    } else {
                                        console.warn('********************************************************************************');
                                        console.warn('*** DEV WARNING: debugger; statement found in code - DO NOT COMMIT THIS CODE ***');
                                        console.warn('********************************************************************************');
                                        return match;   // Return the same string back - just throw a big warning
                                    }
                                }
                            }
                        ]
                    })
                }
            ]
        },
        plugins: [
            new StringReplacePlugin(),
        ]
    };

    return config;
};
