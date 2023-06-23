const categoryApi = 'http://jservice.io/api/category';
const randomApi = 'http://jservice.io/api/random';
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const startResetGameBtn = $('#startGameBtn')


// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds(){
    const response = await axios.get(randomApi, { params: { count: 100 }})
    let catIds = response.data.map(c => c.category_id);

    return _.sampleSize(catIds, NUM_CATEGORIES);
};



/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    response = await axios.get(categoryApi, { params: { id: catId } })
    const category = response.data
    const allClues = category.clues
    let randomClues = _.sampleSize(allClues, NUM_QUESTIONS_PER_CAT);
    let clues = randomClues.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null,
    }));
        return { 
            title: category.title, clues
        };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    let $tr = $('<tr>')
    $('thead').append($tr)
    $('tbody').append($tr)
    for(let q = 0; q<NUM_CATEGORIES; q++){
        // console.log(categories[q].title)
        $tr.append($('<th>').text(categories[q].title))
    }
    $("#jeopardy thead").append($tr)
    for (let q = 0; q < NUM_QUESTIONS_PER_CAT; q++) {
        let $tr = $("<tr>");
        for (let r = 0; r < NUM_CATEGORIES; r++) {
          $tr.append($("<td>").attr("id", `${q}-${r}`).text("?"));
        }
        $("#jeopardy tbody").append($tr)
    }
};

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick() {
    $('td').on( "click", function() {
        const cellText = $(this).text() //gets current text in clicked td
        const columnNum = $(this).attr('id').split("-")[1] //splits ID and gets only 2nd #
        const rowNum = $(this).attr('id').split("-")[0] //splits id and gets only 1st #

        if(cellText == '?'){
            $(this).attr('class', 'showing').text(categories[columnNum].clues[rowNum].question)
        } else {
            $(this).text(categories[columnNum].clues[rowNum].answer)
        }
    });
}


/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
//onLoad this function runs
function startResetGame(){
startResetGameBtn.on( "click", async function() {
    $("#jeopardy thead").empty();
    $("#jeopardy tbody").empty();
    $(startResetGameBtn).append('<img>')
    $('img').attr('src','https://media2.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif')
    await setupAndStart();
    $('img').remove()
    });
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let ids = await getCategoryIds();

    for (let id of ids){
        categories.push( await getCategory(id) )
        // console.log(id)
    } 
    fillTable();
    handleClick();
}