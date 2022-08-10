<template>
<div>
      <v-table
          fixed-header
          id="jobTable"
          height="700"
        >
        <thead>
      <tr>
        <th class="text-left">
          #
        </th>
        <th class="text-left">
          Identifier
        </th>
          <th class="text-left">
          Run by
        </th>
          <th class="text-left">
          Project
        </th>
          <th class="text-left">
          Waited
        </th>
          <th class="text-left">
          Duration
        </th>
          <th class="text-left">
          Devices
        </th>
          <th class="text-left">
          Pass%
        </th>
          <th class="text-left">
          Total
        </th>
          <th class="text-left">
          P
        </th>
          <th class="text-left">
          F
        </th>
          <th class="text-left">
          E
        </th>
          <th class="text-left">
          s
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item,index) in jobs"
        :key="item._id"
      >
        <td>{{index +1}}</td>
        <td>
            <div class="d-flex">
                      <!-- Job Scope Icon -->
                      <span id="icon" style="cursor: pointer">
                        <v-tooltip location="bottom">
                           <template v-slot:activator="{ props }">
                            <v-icon
                              v-bind="props"
                              v-if="
                                item.jobScope && item.jobScope == 'private'"
                            >mdi-lock</v-icon>
                            <v-icon   v-bind="props" v-else>mdi-lock-open</v-icon>
                          </template>
                          <span
                            class="text-capitalize"
                            v-text="item.jobScope ? item.jobScope : 'public'"
                          ></span>
                        </v-tooltip>

                      </span>
                        <v-img
                        height="25"
                        v-if="item.type == 'espresso'"
                        :src="espressoImage"
                        >
                        </v-img>
                          <v-img
                          height="25"
                        v-else-if="item.type == 'xcuitest'"
                        :src="darwinImage"
                        style="width: 20px">
                        </v-img>
                          <v-img
                          style="width: 20px"
                          height="25"
                        v-else-if="item.type == 'appium'"
                        :src="appiumImage">
                        </v-img>
                        <span v-text="item.identifier"></span>
            </div>
        </td>

        <td>
          <span v-text="users[item.user]"></span>
        </td>
                <td>
          <span v-text="projectNames[item.project]"></span>
        </td>
        <td>
            <span
                    v-text="
                      checkWaitTime(
                        item.isStarted,
                        item.isPaused,
                        item.rerunAt,
                        item.created,
                        item.waitTime
                      )
                    "
                  ></span>
        </td>
        <td>
          <span v-text="calculateDuration(item)"></span>
        </td>
<td>
          <span v-text="'-'"></span>
        </td>
        <td>
          <span v-text="getPercentage(item.pass, item.total - item.ignore)"></span>
        </td>
        <td>
            <span v-if="item.isCompleted && item.totalRunTest == 0">
                  <span
                    v-text="item.total - (item.skipped + item.ignore)"
                  ></span>
                </span>
                <span v-else>
                  <span v-text="item.totalRunTest"></span>
                </span>
                <span>
                  /
                  <span v-text="item.total - item.ignore"></span>
                </span>
        </td>
        <td>
          <span v-text="item.pass"></span>
        </td>
        <td>
          <span v-text="item.fail"></span>
        </td>
        <td>
          <span v-text="item.err"></span>
        </td>
        <td>
          <span v-text="item.skipped"></span>
        </td>
      </tr>
    </tbody>
        </v-table>
        <div class="text-xs-center pt-2">
          <v-pagination
            v-model="page"
            :length="totalCount"
            total-visible="10"
          ></v-pagination>
        </div>
    </div>
</template>
<script>
import projectsDetail from "@/assets/projects.json"
import jobsList from "@/assets/jobsList.json"
import usersList from "@/assets/users.json"
import impRobustestImg from "@/assets/img/logo-48x48.png";
import impDarwinImg from "@/assets/img/darwin.png";
import impEspresoImg from "@/assets/img/Espresso.png";
import impAppiumImg from "@/assets/img/Appium.png";
export default {
 name: "jobs",
  data() {
    return {
      projects: projectsDetail,
      jobs: jobsList,
      searchJob: "",
      cuurentIndex: -1,
      users: {},
      passedIndex: [0, 1],
      page: 1,
      usersList,
      pageCount: 0,
      itemsPerPage: 10,
      selectedStatusFilter: "",
      selectedTypeFilter: "",
      statusFilters: ["All", "Completed", "Running", "Queued", "Paused"],
      defaultTypeFilters: [
        { name: "All", validSessionType: "all" },
        { name: "Automator", validSessionType: "automator" },
        { name: "Appium (Browsers)", validSessionType: "appium_hub_browser" },
        { name: "Appium (App)", validSessionType: "appium_hub_app" },
        {
          name: "Selenium (Web Apps)",
          validSessionType: "selenium_hub_browser"
        },
        {
          name: "Roku",
          validSessionType: "roku_hub"
        },
        {
          name: "Karate API",
          validSessionType: "report_hub_app"
        }
      ],
      invalidReRunTypes: [
        "appium_hub_app",
        "appium_hub_browser",
        "selenium_hub_browser",
        "hub",
        "parallel"
      ],
      sortingJobs: [
        { name: "Last updated", value: "updated" },
        { name: "Created date", value: "created" }
      ],
      projectNames: {},
      // Icons
      robustestImage: impRobustestImg,
      darwinImage: impDarwinImg,
      espressoImage: impEspresoImg,
      appiumImage: impAppiumImg,
      showCustomDateTimeModal: false,
      selectedDurationFilter: {},
      showByFilters: [
        {
          name: "Last 24 hours",
          value: "oneDay"
        },
        {
          name: "Last one week",
          value: "oneWeek"
        },
        {
          name: "Last 2 weeks",
          value: "twoWeeks"
        },
        {
          name: "Last one month",
          value: "oneMonth"
        },
        {
          name: "Last 2 months",
          value: "twoMonths"
        },
        {
          name: "Custom",
          value: "custom"
        }
      ],

      jobStatusIconSize: 22,
      selectedJob: {},
      actionsTooltipText: "Click job status icon to access job actions",
      jobScopeFilters: [
        {
          name: "All",
          value: "all"
          // icon: "all_inclusive"
        },
        {
          name: "Public",
          value: "public"
          // icon: "lock_open"
        },
        {
          name: "Private",
          value: "private"
          // icon: "lock"
        }
      ],
      totalCount: 0,
    };
  },
  methods:{
  getDuration(end, start) {
      let millisec = Math.abs(new Date(end) - new Date(start));
      let seconds = Math.round(millisec / 1000);
      return this.getValueInHHMMSS(seconds);
    },
    getValueInHHMMSS(seconds) {
  // Calculating hours
  let hours = parseInt(seconds / 3600);
  let hoursRemainder = Math.round(seconds % 3600);

  // Calculating minutes
  let minutes = parseInt(hoursRemainder / 60);

  // Calculating seconds
  seconds = Math.round(hoursRemainder % 60);

  if (hours > 0) {
    return (
      this.checkValue(hours) + ":" + this.checkValue(minutes) + ":" + this.checkValue(seconds)
    );
  } else if (minutes > 0) {
    return "00:" + this.checkValue(minutes) + ":" + this.checkValue(seconds);
  } else {
    return "00:00:" + this.checkValue(seconds);
  }
},
getPercentage(value, total) {
  let percentage;
  if (total > 0) {
    percentage = (value / total) * 100;
    return percentage.toFixed(2) + "%";
  } else {
    return "-";
  }
},
getIdleTime(seconds) {
  let hours = parseInt((seconds / 3600).toFixed(2));
  let hoursRemainder = Math.round(seconds % 3600);

  // Calculating minutes
  let minutes = parseInt((hoursRemainder / 60).toFixed(2));

  // Calculating seconds
  seconds = Math.round(hoursRemainder % 60);

  if (hours > 0) {
    return (
      this.checkValue(hours) + ":" + this.checkValue(minutes) + ":" + this.checkValue(seconds)
    );
  } else if (minutes > 0) {
    return "00:" + this.checkValue(minutes) + ":" + this.checkValue(seconds);
  } else {
    return "00:00:" + this.checkValue(seconds);
  }
},
checkWaitTime(isStarted, isPaused, reRunAt, created, waitTime) {
      // If started and paused is false (If paused is true wait time is provided)
      if (!isStarted && !isPaused) {
        if (this.checkValidDate(reRunAt)) {
          return this.getDuration(Date(), reRunAt);
        } else {
          return this.getDuration(Date(), created);
        }
      } else {
        return this.getIdleTime(waitTime);
      }
    },
    checkValidDate(date) {
  if (
    new Date(date).toLocaleString("en-GB", options).split(",")[0] == "1 Jan 1"
  ) {
    return false;
  }
  return true;
},
  checkValue(val) {
      if (val < 10) {
        return "0" + val;
      } else {
        return val;
      }
    },

    calculateDuration(jobDetail) {
      if (jobDetail.isStarted) {
        return "-";
      } else if (
        jobDetail.isStarted &&
        jobDetail.isCompleted &&
        jobDetail.rerunAt &&
        !this.checkValidDate(jobDetail.rerunAt)
      ) {
        let millisec = Math.abs(
          new Date(Date()) - new Date(jobDetail.started)
        );
        let seconds = Math.round(millisec / 1000);
        return this.getIdleTime(seconds);
      } else if (
        jobDetail.isStarted &&
        !jobDetail.isCompleted &&
        jobDetail.rerunAt &&
        checkValidDate(jobDetail.rerunAt)
      ) {
        return this.getIdleTime(this.jobDetail.duration);
      } else if (jobDetail.isStarted && jobDetail.isCompleted) {
        if (jobDetail.duration > 0) {
          return this.getIdleTime(jobDetail.duration);
        } else {
          if (
            this.checkValidDate(jobDetail.completed) &&
            this.checkValidDate(jobDetail.started)
          ) {
            return this.getDuration(
              jobDetail.completed,
             jobDetail.started
            );
          } else {
            return "-";
          }
        }
      }
    }
  },
  created(){
   for(let i=0;i<this.projects.length;i++){
    if(this.projects[i].name){
     this.projectNames[this.projects[i]._id] = this.projects[i].name
    }
   }
   for(let i=0;i<this.usersList.length;i++){
    if(this.usersList[i].name){
     this.users[this.usersList[i]._id] = this.usersList[i].name
    }
   }
  }
}
</script>
<style>
.v-img__img{
  width: 20px !important
}
.v-responsive{
  width:30px !important;
  flex:none !important;
}
#jobTable{
  border: 1px solid black;
  margin: 20px;
}
</style>