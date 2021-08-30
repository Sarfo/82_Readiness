//Physical Performance Domain:
var physicalPerfDisc={A:"Paratrooper advised to see Physical/Occupational Therapist,"+
                        "Nutritionist, ATC, Strength Coach as soon as possible",
                      B:"Paratrooper may benefit from seeing "+   
                        "Physical/Occupational Therapist, Nutritionist, ATC, Strength Coach to enhance their performance.",
                      C:"Paratrooper is performing at an optimal state and should be using a standardized physical training"+
                         "program provided by your H2F team or Master Fitness Trainer."
                    };
//Cognitive Performance Domain:
var cognitivePerDisc={A:"Paratrooper advised to see Behavioral Health Officer as soon as possible.",
                      B:"Paratrooper may benefit from seeing Occupational Therapist ,Cognitive Enhancement Specialist or Chaplain to enhance their performance.",
                      C:"Paratrooper is performing at an optimal state"
                  };

//html page 
var htmlPages;
//convert CSV file to dictionary row={colHeading:colCellValue}
function csvToDictionary(csvdata) {
  var allRows = csvdata.split(/\r\n|\n/);
  if(allRows.length===0){
    return {};
  }
  var data = [];
  var headers= allRows[0].split(",");
  for (var singleRow = 1; singleRow < allRows.length; singleRow++) {

    console.log(allRows[singleRow]);

    data.push({});//create new row
    var rowCellsStr = allRows[singleRow].toString();
    let charStr="";
    let strFound=false;
    let cellCount=0;
    for (var rowCell = 0; rowCell < rowCellsStr.length; rowCell++) {
        let charValue=rowCellsStr[rowCell];
        if(charValue=='"'){ //if cell is string value
            if(strFound){
                strFound=false;
            }else{
                strFound=true;
            }
            
        }else if(charValue=="," && strFound==false){  //store value value when read to the end of the cell value
             const key=headers[cellCount];
             const value=charStr;
             data[singleRow-1][key]=value;
             charStr="";
             ++cellCount;
        }else{
            charStr=charStr.toString()+ charValue.toString();
           
        }
    }
  } 
  return data;
}




function printData(_url /*,callback*/){
 
      var pages=[];
      $.ajax({url:_url,
            method: "GET",       
            success:function(csvd){
               let rowsData=csvToDictionary(csvd);
                rowsData.forEach(function(row){
                     populateHtmlPage(row);
                     backgroundDomainHtml(row);
                      window.print();
                    
                });               
            },

            headers: {"Access-Control-Allow-Origin":"*",},
       
     });
 

  }
function populateHtmlPage(row){
     //alert(Object.keys(row).length)
         let dodID=row["dod_id"];
                //physical and cognitive result
           var presult=calculateTotalPhysicalResolt(row);
            var cresult=calculateCognitive(row);
           let aicData={dod_id:[dodID],pScore:[presult["result"]],cScore:[cresult["result"]]}

                //aic score

            let aicScore=aicReadinessScore(aicData);
            let pDiscription=physicalPerfDisc[presult["result"]];
            let cDiscription=cognitivePerDisc[cresult["result"]];

                // populate html
            drawChart(aicScore["result"])
            $("#dodID").text(dodID);
            $("#physicalInfo").text(pDiscription);
            $("#cognitiveInfo").text(cDiscription);
                 
        
}

 function  calculatePhysicalResult(rowData){
      var physical_dict = {0:'C', 1:'B', 2:'B', 3:'A', 4:'A', 5:'A'}
       var physical_counter=0;
         physical_counter+=parseInt(rowData['recent_surgery']);
         physical_counter+=parseInt(rowData['recent_surgery']);
         physical_counter+=parseInt(rowData['profile']);
         physical_counter+=parseInt(rowData['stress_fx']);
         physical_counter+=parseInt(rowData['acft_pain']);

       let physical_result="";
       if(parseInt(rowData["upper_qtr_screen"])==1 ||
          parseInt(rowData["lower_qt_screen_prs"])==1||
          parseInt(rowData["lower_qt_screen_sqt"])==1){
          physical_result="A"
      } else{
          physical_result=physical_dict[[physical_counter]];
        
      }

      return physical_result;


    }

  function calculateSCATResult(rowData){
     let result="";
     let twoMilesRun=parseInt(rowData["two_mile_run"]);
     if(parseInt(rowData["low_acft"])==1){
         result="A";
     }else if(twoMilesRun<=14){
         result="B";
     }else if(two_mile_run>14 && two_mile_run<18){
         result="C";
     }else{
        result="A"
     }

     return result;
  }

function calculate_bmi(weight, height){
  return (weight*703)/(height**2);
}
function calculateDietetionResult(rowData){
      let result=""
      let bmi=calculate_bmi(parseInt(rowData['weight']),parseInt(rowData['height']));
      if(parseInt(rowData["nicotine"])==1){
        result="B";
      }else if(bmi<16 || bmi>30){
         result="A"
      }else if(bmi>18 && bmi<25){
         return "C"
      }

      return result;
   }


   //not logical
   function calculateSleepResult(rowData){
       let result="";
       if(rowData['avg_sleep']>=6){
           result="C"
       }else if(rowData["avg_sleep"]<=5){
           result="A";
       }else {
          result="B";
       }

       return result;
   }



   function calculateTotalPhysicalResolt(rowData){ 
    let result={}

     let data=[calculatePhysicalResult(rowData),
                 calculateSCATResult(rowData),
                 calculateDietetionResult(rowData),
                 calculateSleepResult(rowData)];

     let dataCount=(data.toString().match(/A/g)||[]).length;
     if(dataCount>=2){
        result={dod_id:rowData["dod_id"],result:"A"};
     }else if(dataCount==1){
        result={dod_id:rowData["dod_id"],result:"B"};
     }else{
       result={dod_id:rowData["dod_id"],result:"C"};
     }
     return result;
   }





    function drawChart(score){
      var data = [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value:score,
        title: { text: "Teem Readiness"},
        type: "indicator",
        mode: "gauge+number",
        gauge: {'axis': {'range': [0, 100], 'tickcolor': "black"},
                 'bar': {'color': "black"},
                 'steps' : [
                     {'range': [0, 20], 'color': "red"},
                     {'range': [20, 82], 'color': "white"},
                     {'range': [82, 100], 'color': "blue"}],
                 'threshold' : {'line': {'color': "black", 'width': 8}, 'thickness': 0.85, 'value': 82}}
      }
    ];

    var layout = { width: 600, height: 400 };
    Plotly.newPlot('myDiv', data, layout);
}





function calculateCognitive(rowData){
    let result={};
    let count=parseInt(rowData["achieve_goals"])+
              parseInt(rowData["focus_on_tasks"])+ 
              parseInt(rowData["emotion_performance"])+
              parseInt(rowData["strive_success"])+ 
              parseInt(rowData["knowledge_exec"])+
              parseInt(rowData["overcome_adversity"])+
              parseInt(rowData["skills_exec"])+
              parseInt(rowData["positive_outlook"]);
     if(count<=32){
        result={dod_id:rowData["dod_id"],result:"A"};
     }else if(count>32 && count<48){
         result={dod_id:rowData["dod_id"],result:"B"};
     }else if(count>=48){
         result={dod_id:rowData["dod_id"],result:"C"};
     }
     return  result;
}   


//param  = dictionary ={dod_di:"",pScore:"",cScore:""}
//pScore=physical score
//cScore=cognitive score
//dod_id
function aicReadinessScore(param){
     let aicScore=param["pScore"].toString()+param["cScore"].toString();
     let scoreMapping = {'CC':100, 'CB':90, 'BC':90, 'BB':80, 'AC':70, 'CA':70, 'AB':60, 'BA':60, 'AA':50}
     
     try{
        return {dod_id:param["dod_id"],result:scoreMapping[[aicScore]]};
     }catch(err){
        return {dod_id:param["dod_id"],result:0}
     }
     return  {dod_id:param["dod_id"],result:0};

}

function backgroundDomainHtml(rowData){
       //console.log(rowData)
       $("#marriage").text(rowData["marriage_status"]);
       $("#firstMarriage").text(parseInt(rowData["first_marr"]));
       $("#children").text(rowData["children"]);
       $("#living").text(rowData["living_area"]);
       $("#financialChange").text(rowData["financial_changes"]);
       $("#prevAssignment").text(rowData["prev_assignment"]);
       $("#religiousSpiritual").text(rowData["religious_spiritual"]);
       $("#hobbies").text(rowData["hobbies"]);
       $("#additionalComments").text(rowData["additional_comments"]);
     
}


$(document).ready(function() {
    printData("http://127.0.0.1:5000/data");        
});
