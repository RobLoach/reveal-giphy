// Dependencies
var giphy = require('giphy-api')()
var yaml = require('yamljs')
var fs = require('fs')
var exec = require('child_process').execSync
var async = require('async')
var tempfile = require('tempfile')

// Load all the slides.
var slides = yaml.load('slides.yaml')

/**
 * Process an individual slide, retrieving a gif for it.
 */
function processSlide(slide, done) {
    // Select a random gif from Giphy
    giphy.random(slide).then(function(image) {
        // Create the new slide markdown for reveal-md use.
        var img = image.data.image_url

        // Set the image as a background image for the slide.
        var output = '<!-- .slide: data-background="' + img + '" -->\n'

        // If there is header content, append it.
        if (slides[slide]) {
            output += '# ' + slides[slide]
        }

        // Output as an individual image.
        //output += '\n![](' + img + ')'

        done(null, output)
    }).catch(done)
}

// Process through each slide.
async.map(Object.keys(slides), processSlide, function (err, result) {
    if (err) {
        throw err
    }

    // Complete the markdown for the slide deck for reveal-md.
    var markdown = result.join('\n\n---\n\n')

    // Output the markdown to a temporary file.
    var file = tempfile('.md')
    fs.writeFileSync(file, markdown)

    // Run reveal-md on the slide deck.
    exec('reveal-md ' + file)
})
