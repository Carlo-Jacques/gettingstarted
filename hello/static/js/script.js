$(document).ready(function() {
    const updateProgress = (activeStep) => {
        $('#progressbar li').removeClass('active');
        for (let i = 1; i <= activeStep; i++) {
            $(`#step${i}Indicator`).addClass('active');
        }
    };

    const stepQueue = [];
    
    let currentStepIndex = 0;
    
    //let sameAgentValue = false;


    function showStep(index) {
        $('.step').hide();
        const currentId = stepQueue[index];
        const currentStep = $('#' + currentId);
        currentStep.show();
        updateProgress(index + 1);

        // Per-step back button control
        //if (index === 0) {
            //currentStep.find('.btn-back').hide();
        //} else {
            //currentStep.find('.btn-back').show();
        //}

        // Optional: refresh review step
        if (currentId === 'reviewStep') {
            const clone = $('#dynamicForm').clone();
            clone.find('.step').show();
            const formData = clone.serializeArray();
            const reviewBlock = $('#reviewContent');
            reviewBlock.empty();
            formData.forEach(field => {
                reviewBlock.append(`<p><strong>${field.name}</strong>: ${field.value}</p>`);
            });
        }
    }
    
    function buildProgressBar() {
      const progressBar = $('#progressbar');
      progressBar.empty();

      stepQueue.forEach((stepId, i) => {
        const label = $(`#${stepId}`).data('label') || `Step ${i + 1}`;
        const activeClass = i === 0 ? 'active' : '';
        progressBar.append(`<li id="step${i + 1}Indicator" class="${activeClass}">${label}</li>`);
      });
    }


    function updateSubmitState() {
      const hasSelection = $('input[name="document_types"]:checked').length > 0;

      $('.btn-submit').prop('disabled', !hasSelection);

      if (hasSelection) {
        $('#formAlert').addClass('hidden');
      } else {
        $('#formAlert').removeClass('hidden');
      }
    }

    // Handle checkbox changes
    $('input[name="document_types"]').on('change', updateSubmitState);

    // Show inline alert if user tries to click a disabled button
    $('.btn-submit').on('click', function (e) {
      if ($(this).prop('disabled')) {
        e.preventDefault();
        $('#formAlert').removeClass('hidden');
      }
    });
    

    const agentFields = (label, prefix, stepId) => {
            stepQueue.push(stepId);
            return `
            <div id="${stepId}" class="step" data-label="${label}" style="display:none">
              <h4>${label}</h4>     
              <div class="row">
            <div class="col-md-6">
            <div class="form-group">
              <label>Full Name *</label>
              <input type="text" name="${prefix}_full_name" class="form-control" required>
            </div>
            </div>
            <div class="col-md-6">
            <div class="form-group">
              <label>Phone Number *</label>
              <input type="tel" name="${prefix}_phone" class="form-control" required>
            </div>
            </div>
            </div>
            <div class="row">
            <div class="col-md-6">
            <div class="form-group">
              <label>Address Line 1 *</label>
              <input type="text" name="${prefix}_address_1" class="form-control" autocomplete="address-line1" required>
            </div>
            </div>        
            <div class="col-md-6">
            <div class="form-group">
              <label>Address Line 2</label>
              <input type="text" name="${prefix}_address_2" class="form-control" autocomplete="address-line2">
            </div>
            </div>
            </div>        
            <div class="row">
            <div class="col-md-4">
            <div class="form-group">
              <label>City *</label>
              <input type="text" name="${prefix}_city" class="form-control" required autocomplete="address-level2">
            </div>
            </div>
            <div class="col-md-4">
            <div class="form-group">
              <label>State *</label>
              <input type="text" name="${prefix}_state" class="form-control" required autocomplete="address-level1">
            </div>
            </div>
            <div class="col-md-4">
            <div class="form-group">
              <label>Zip *</label>
              <input type="text" name="${prefix}_zip" class="form-control" required autocomplete="postal-code">
            </div>
            </div>
            </div>
            <div class="form-group">
              <label>County *</label>
              <input type="text" name="${prefix}_county" class="form-control" required>
            </div>
              <div class="d-flex justify-content-between mt-3">
                  <button type="button" class="btn btn-secondary btn-back">Back</button>
                  <button type="button" class="btn btn-primary btn-next">Next</button>
                </div>
            </div>
          `;
                };

    
    $(document).on('click', '.btn-next', function () {

        const currentId = stepQueue[currentStepIndex];

        const nextIndex = currentStepIndex + 1;
        const nextStepId = stepQueue[nextIndex];
        console.log(stepQueue);

        console.log(`✅ Next clicked`);
        console.log(`➡️ Current step index: ${currentStepIndex}, ID: ${currentId}`);
        console.log(`➡️ Next step index: ${nextIndex}, ID: ${nextStepId}`);
        console.log(`🔍 sameAgentValue: ${sameAgentValue}`);


    if (currentStepIndex < stepQueue.length - 1) {
        currentStepIndex++;
        showStep(currentStepIndex);
    }
        console.log("Next clicked. Moving to step index:", currentStepIndex, "ID:", stepQueue[currentStepIndex]);
        
    });

    $(document).on('click', '.btn-back', function () {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            showStep(currentStepIndex);
        }
    });
    
    $(document).on('click', '.btn-back-to-selection', function () {
        $('#dynamicForm').hide();
        $('#formSelection').show();
        currentStepIndex = 0;
        stepQueue.length = 0;
    });
    
    
    $('input[name="document_types"]').on('change', function () {
        const selectedCount = $('input[name="document_types"]:checked').length;

        if (selectedCount >= 2) {
            $('#agent-question').show();
            $('input[name="sameAgent"]').prop('required', true); // require answer
        } else {
            $('#agent-question').hide();
            $('input[name="sameAgent"]').prop('required', false); // un-require
            $('input[name="sameAgent"]').prop('checked', false); // reset choice
        }
    });

    //sameAgentValue = $('input[name="sameAgent"]:checked').val();
    //console.log("✅ sameAgentValue on submit:", sameAgentValue);


        
    
    $('#formSelection').on('submit', function(e) {
        e.preventDefault();
        const selected = $('input[name="document_types"]:checked')
            .map(function() {
                return this.value;
            }).get();

        const selectedDocs = $('input[name="document_types"]:checked').length;
        const isAgentQuestionVisible = $('#agent-question').is(':visible');
        
        sameAgentValue = $('input[name="sameAgent"]:checked').val() === 'true';
                //console.log("✅ sameAgentValue on submit:", sameAgentValue);
        
        if (selectedDocs >= 2 && !$('input[name="sameAgent"]:checked').val()) {
            e.preventDefault();
            alert('Please select whether you want to use the same agent for both forms.');
            return false;
          }
        
        if (selectedDocs === 0) {
            alert("Please select at least one document type.");
            return;
        }
        
        buildForm(selected, sameAgentValue); // ✅ pass flag only once
        //console.log("passed in buildForm function", sameAgentValue);
        
        buildProgressBar();


        currentStepIndex = 0;

        updateProgress(2);
        $('#formSelection').hide();
        $('#dynamicForm').show();
        showStep(currentStepIndex);
    });
    
    function buildForm(docTypes, sameAgentValue) {

        console.log(sameAgentValue);
        
        console.log("in buildForm function:", sameAgentValue);
        const form = $('#dynamicForm');
        form.empty();
        stepQueue.length = 0;

        form.append(`
          <div id="personalInfoStep" class="step" data-label="Personal Information">
          <h4>Personal Information</h4>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>First Name *</label>
                <input type="text" name="first_name" class="form-control" required autocomplete="given-name">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label>Last Name *</label>
                <input type="text" name="last_name" class="form-control" required autocomplete="family-name">
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" class="form-control" required autocomplete="email">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" class="form-control" autocomplete="tel">
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>US Address Line 1 *</label>
                <input type="text" name="address_line_1" class="form-control" required autocomplete="address-line1">
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label>US Address Line 2 (Optional)</label>
                <input type="text" name="address_line_2" class="form-control" autocomplete="address-line2">
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label>City *</label>
                <input type="text" name="city" class="form-control" required autocomplete="address-level2">
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label>State *</label>
                <input type="text" name="state" class="form-control" required autocomplete="address-level1">
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label>Zip Code *</label>
                <input type="text" name="zip" class="form-control" required autocomplete="postal-code">
              </div>
            </div>
          </div>
          <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label>County *</label>
              <input type="text" name="county" class="form-control" required>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Last Four of SSN*</label>
              <input type="text" name="last_four" class="form-control" required>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Sex *</label><br>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="sex" id="male" value="MALE" required>
            <label class="form-check-label" for="male">Male</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" name="sex" id="female" value="FEMALE" required>
            <label class="form-check-label" for="female">Female</label>
          </div>
        </div>
        <div class="d-flex justify-content-between mt-3">
            <button type="button" class="btn btn-outline-secondary btn-back-to-selection">Back to Form Selection</button>
            <button type="button" class="btn btn-primary btn-next">Next</button>
        </div>
        </div>
        `);
        stepQueue.push('personalInfoStep');
        

        if (docTypes.includes('will')) {
            stepQueue.push('willStep');
            form.append(`
                <div id="willStep" class="step" style="display:none" data-label="Children">
                  <h4>Will Information</h4>
                  <div class="form-group">
                    <label>Do you have children?</label><br>
                    <label><input type="radio" name="has_children" value="yes"> Yes</label>
                    <label><input type="radio" name="has_children" value="no"> No</label>
                  </div>
                  <div class="form-group" id="childrenCountGroup" style="display:none;">
                    <label>How many children?</label>
                    <input type="number" min="1" class="form-control" id="childrenCount">
                  </div>
                  <div id="childrenInputs"></div>
                  <div class="d-flex justify-content-between mt-3">
                      <button type="button" class="btn btn-secondary btn-back">Back</button>
                      <button type="button" class="btn btn-primary btn-next">Next</button>
                    </div>

                </div>
                `);
            if (sameAgentValue === false) {
                form.append(agentFields("Will Executor / Trustee - Agent 1", "will_agent_1", "willAgentStep1"));
                //stepQueue.push('willAgentStep1');
                
                //stepQueue.push('willAgentStep2');
                form.append(agentFields("Will Alternate Executor / Trustee - Agent 2", "will_agent_2", "willAgentStep2"));

              } else {
                console.log("✔ Skipping Will agent steps because shared agent is used.");
              }        
        }

        console.log(sameAgentValue);
        
        if (sameAgentValue === true) {
          // Insert shared agent steps BEFORE reviewStep
          form.append(agentFields("Executor - Agent 1", "shared_agent_1", "sharedAgentStep1"));
          //stepQueue.push("sharedAgentStep1");

          form.append(agentFields("Executor - Agent 2", "shared_agent_2", "sharedAgentStep2"));
          //stepQueue.push("sharedAgentStep2");
        }
        
        if (docTypes.includes('poa')) {
            console.log("!POA out", sameAgentValue);

            if (sameAgentValue === false) {
                console.log("!POA in", !sameAgentValue);
                form.append(agentFields("POA Executor / Trustee - Agent 1", "poa_agent_1", "poaAgentStep1"));
                //stepQueue.push('poaAgentStep1');
                
                //stepQueue.push('poaAgentStep2');
                form.append(agentFields("POA Alternate Executor / Trustee - Agent 2", "poa_agent_2", "poaAgentStep2"));

            }
        }

        if (docTypes.includes('living')) {
            if (sameAgentValue === false) {
                //stepQueue.push('livingAgentStep1');                
                form.append(agentFields("Living Will Agent - Agent 1", "living_agent_1", "livingAgentStep1"));
                //stepQueue.push('livingAgentStep2');
                form.append(agentFields("Living Will Successor Agent - Agent 2", "living_agent_2", "livingAgentStep2"));
            }
            stepQueue.push("LivingWillQualityofLifeStep");

            form.append(`
              <div id="LivingWillQualityofLifeStep" class="step" style="display:none" data-label="Living Will Quality of Life">
                <h4>Quality of Life Questions</h4>

                <!-- Unacceptable quality of life section -->
                <h5>An unacceptable quality of life means (initial and check all that apply):</h5>
                <div class="form-group">
                  <label>
                    <input type="text" name="lw_ls_initial_coma" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
                    <input type="checkbox" name="lw_ls_check_coma" /> Chronic coma or persistent vegetative state
                  </label>
                </div>
                <div class="form-group">
                  <label>
                    <input type="text" name="lw_ls_initial_nocomm" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
                    <input type="checkbox" name="lw_ls_check_nocomm" /> No longer able to communicate my needs
                  </label>
                </div>
                <div class="form-group">
                  <label>
                    <input type="text" name="lw_ls_initial_recff" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
                    <input type="checkbox" name="lw_ls_check_recff" /> No longer able to recognize family or friends
                  </label>
                </div>
                <div class="form-group">
                  <label>
                    <input type="text" name="lw_ls_initial_totdep" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
                    <input type="checkbox" name="lw_check_totdep" /> Total dependence on others for daily care
                    </label>
                </div>
                <div class="form-group">
                  <label>
                    <input type="text" name="lw_ls_initial_other" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
                    <input type="checkbox" name="lw_ls_check_other" /> Other: <input type="text" name="lw_ls_text_other" placeholder="Include other unacceptable quality of life" class="form-control d-inline-block" style="width:240px;" />
                  </label>
                </div>
                <hr>
                <h5>Initial and check only one:</h5>
                <div class="form-group">
                  <label class="d-flex align-items-center">
                    <input type="text" name="lw_foodwater_initial_yes" placeholder="Initials" class="form-control d-inline-block mr-2" style="width:90px;" />
                    <input type="radio" name="lw_foodwater_choice" value="yes" class="mr-2" />
                    Even if I have the quality of life described above, I still wish to be treated with food and water by tube or intravenously (IV).
                  </label>
                </div>
                <div class="form-group">
                  <label class="d-flex align-items-center">
                    <input type="text" name="lw_foodwater_initial_no" placeholder="Initials" class="form-control d-inline-block mr-2" style="width:90px;" />
                    <input type="radio" name="lw_foodwater_choice" value="no" class="mr-2" />
                    If I have the quality of life described above, I do NOT wish to be treated with food and water by tube or intravenously (IV).
                  </label>
                </div>
                <div class="d-flex justify-content-between mt-3">
                  <button type="button" class="btn btn-secondary btn-back">Back</button>
                  <button type="button" class="btn btn-primary btn-next">Next</button>
                </div>
                </div>
          `);
    stepQueue.push('livingTreatmentStep');
    form.append(`
      <div id="livingTreatmentStep" class="step" style="display:none" data-label="Living Treatment">
        <h4>CERTAIN LIFE-SUSTAINING TREATMENT</h4>
        <p><em>(You do not have to initial and check any of these if you do not wish to)</em></p>
        <p>Some people do not wish to have certain life sustaining treatments under any circumstance, even if recovery is a possibility. Check treatments below, if any, that you do not wish to have under any circumstances:</p>

        <div class="form-group">
          <label>
            <input type="text" name="lw_cpr_initial" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
            <input type="checkbox" name="lw_cpr" /> Cardiopulmonary Resuscitation (CPR)
          </label>
        </div>

        <div class="form-group">
          <label>
            <input type="text" name="lw_vent_initial" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
            <input type="checkbox" name="lw_vent" /> Ventilation (breathing machine)
          </label>
        </div>

        <div class="form-group">
          <label>
            <input type="text" name="lw_feed_initial" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
            <input type="checkbox" name="lw_feed" /> Feeding tube
          </label>
        </div>

        <div class="form-group">
          <label>
            <input type="text" name="lw_dialysis_initial" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
            <input type="checkbox" name="lw_dialysis" /> Dialysis
          </label>
        </div>

        <div class="form-group">
          <label>
            <input type="text" name="lw_other_initial" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
            <input type="checkbox" name="lw_other" /> Other: 
            <input type="text" name="lw_other_text" class="form-control d-inline-block" style="width:240px;" />
          </label>
        </div>

        <div class="d-flex justify-content-between mt-3">
          <button type="button" class="btn btn-secondary btn-back">Back</button>
          <button type="button" class="btn btn-primary btn-next">Next</button>
        </div>
      </div>
    `);
    stepQueue.push("healthcarePOAStep");
    form.append(`
      <div id="healthcarePOAStep" class="step" style="display:none" data-label="Health Care">
        <h4>HEALTH CARE (MEDICAL) POWER OF ATTORNEY WITH MENTAL HEALTH AUTHORITY</h4>
        <p>
          It provides peace of mind to be able to choose someone you know and who knows you to make healthcare decisions on your behalf when you no longer can communicate your wishes.
          It is important that you discuss your wishes with your health care agent so they can be sure to make sure your wishes are carried out by the health care providers.
          If you DO NOT, however, choose someone to make decisions for you, write NONE in the line for the agent’s name.
        </p>

        <div class="form-group">
          <label>Agent Name:</label>
          <input type="text" name="healthcare_agent_name" class="form-control" />
        </div>

        <div class="form-group">
          <label>
            <input type="text" name="healthcare_initial_psych" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
            I specifically consent to giving my agent the power to admit me to an inpatient or partial psychiatric hospitalization program if ordered by my physician.
          </label>
        </div>

        <div class="form-group">
          <label>
            <input type="text" name="healthcare_initial_irrevocable" placeholder="Initials" class="form-control d-inline-block" style="width:90px;" />
            This Health Care Directive including Mental Health Care Power of Attorney may not be revoked if I am incapacitated.
          </label>
        </div>

        <div class="d-flex justify-content-between mt-3">
          <button type="button" class="btn btn-secondary btn-back">Back</button>
          <button type="button" class="btn btn-primary btn-next">Next</button>
        </div>
      </div>
    `);     
    }
    

    stepQueue.push('reviewStep');
    form.append(`
        <div id="reviewStep" class="step" style="display:none"data-label="Review">
        <h4>Review Your Information</h4>
        <div id="reviewContent" class="mb-3"></div>
        <div class="text-right">
          <button type="submit" class="btn btn-success">Submit forms</button>
        </div>
        </div>
    `);
    }
        
    $(document).on('change', 'input[name="has_children"]', function() {
        if ($(this).val() === 'yes') {
            $('#childrenCountGroup').show();
        } else {
            $('#childrenCountGroup').hide();
            $('#childrenInputs').empty();
        }
    });



    $(document).on('input', '#childrenCount', function() {
        const count = parseInt($(this).val());
        const container = $('#childrenInputs');
        container.empty();
        if (!isNaN(count) && count > 0) {
            for (let i = 1; i <= count; i++) {
                container.append(`
              <div class="form-group">
                <label>Child ${i} Name</label>
                <input type="text" name="child_${i}" class="form-control" />
              </div>
            `);
            }
        }
    });


    function formatChildrenList(names) {
        if (!Array.isArray(names) || names.length === 0) return "";

        const upperNames = names.map(name => name.trim().toUpperCase());

        if (upperNames.length === 1) {
            return upperNames[0];
        }

        if (upperNames.length === 2) {
            return `${upperNames[0]} and ${upperNames[1]}`; // 'and' lowercase
        }

        return `${upperNames.slice(0, -1).join(', ')}, and ${upperNames[upperNames.length - 1]}`;
    }

    // Helper to convert month number to name
    function getMonthName(monthNum) {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[parseInt(monthNum, 10) - 1];
    }

    function getGenderTerms(sex) {
        const s = (sex || '').toUpperCase();
        return {
            testator_testatrix: s === 'FEMALE' ? 'Testatrix' : 'Testator',
            father_mother: s === 'FEMALE' ? 'Mother' : 'Father',
            pronoun_subject: s === 'FEMALE' ? 'She' : 'He',
            pronoun_object: s === 'FEMALE' ? 'Her' : 'Him',
            pronoun_possessive: s === 'FEMALE' ? 'Her' : 'His',
        };
    }

    // Monitor checkbox state and control button
    $('input[name="document_types"]').on('change', function () {
        const selected = $('input[name="document_types"]:checked').length > 0;

        //console.log(selected);
    });
    

    $('#dynamicForm').off('submit').on('submit', function(e) {
        e.preventDefault();

        const clone = $('#dynamicForm').clone();
        clone.find('.step').show();
        const formData = clone.serializeArray();

        const payload = {};
        formData.forEach(field => {
            payload[field.name] = field.value;
        });

        const gendered = getGenderTerms(payload.sex);
        Object.assign(payload, gendered); 

        const childNames = [];
        formData.forEach(field => {
            if (field.name.startsWith("child_") && field.value.trim() !== "") {
                childNames.push(field.value.trim());
            }
        });
        payload["CHILDREN"] = formatChildrenList(childNames);

        payload["date"] = $('input[name="date"]').val();

        // 🔽 Split date into day/month/year if date is present
        if (payload["date"]) {
            const [year, month, day] = payload["date"].split("-");
            payload["day"] = day;
            payload["month"] = getMonthName(month);
            payload["year"] = year;
        }

        payload["document_types"] = $('input[name="document_types"]:checked')
            .map(function() {
                return this.value;
            }).get();
        payload["date"] = $('input[name="date"]').val();
        
        console.log(payload);

        $.ajax({
            url: 'generate.php',
            method: 'POST',
            data: payload,
            success: function(response) {
                $('#result').html(response);
            },
            error: function(xhr, status, error) {
                $('#result').html("<p style='color:red;'>Error: " + error + "</p>");
            }
        });
    });
});
