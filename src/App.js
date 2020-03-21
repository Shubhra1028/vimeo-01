import React from "react";
import "./styles.css";
import TablePagination from "@material-ui/core/TablePagination";
import CircularProgress from "@material-ui/core/CircularProgress";
import Sort from "@material-ui/icons/Sort";
import axios from "axios";
import Plot from "react-plotly.js";

export default class App extends React.Component {
  state = {
    headings: [
      "Date",
      "Transaction Details",
      "Value Date",
      "Transaction AMT",
      "Balance AMT"
    ],
    data: null,
    rowsPerPage: 10,
    page: 0
  };

  componentDidMount() {
    const url = "http://starlord.hackerearth.com/bankAccount";
    axios
      .get("https://cors-anywhere.herokuapp.com/" + url)
      .then(res => {
        this.setState({
          data: res.data
        });
      })
      .catch(error => console.error(error));
  }

  sortByDate = value => () => {
    const { data } = this.state;
    let sortedData = data.sort((a, b) => {
      return new Date(b[value]) - new Date(a[value]);
    });
    this.setState({
      data: sortedData
    });
  };

  sortByAmt = value => () => {
    const { data } = this.state;
    let sortedData =
      value === "Transaction"
        ? data.sort((a, b) => {
            let amtA = parseFloat(
              a["Withdrawal AMT"] !== ""
                ? a["Withdrawal AMT"].split(",").join("")
                : a["Deposit AMT"].split(",").join("")
            );
            let amtB = parseFloat(
              b["Withdrawal AMT"] !== ""
                ? b["Withdrawal AMT"].split(",").join("")
                : b["Deposit AMT"].split(",").join("")
            );
            return amtB - amtA;
          })
        : data.sort((a, b) => {
            let amtA = parseFloat(a["Balance AMT"].split(",").join(""));
            let amtB = parseFloat(b["Balance AMT"].split(",").join(""));
            return amtB - amtA;
          });
    this.setState({
      data: sortedData
    });
  };

  renderHeads = () => {
    return this.state.headings.map((val, index) => {
      return (
        <td key={index} onClick={index === 0 ? this.sortByDate : null}>
          {" "}
          {val}{" "}
        </td>
      );
    });
  };

  renderData = () => {
    const { headings, rowsPerPage, page } = this.state;
    var { data } = this.state;
    let display = [];
    for (
      let index = rowsPerPage * page;
      index < rowsPerPage * (page + 1) && index < data.length;
      index++
    ) {
      var val = data[index];
      display.push(
        <tr key={index}>
          <td> {val[headings[0]]} </td>
          <td> {val[headings[1]]} </td>
          <td> {val[headings[2]]} </td>
          <td
            style={{
              color: val["Withdrawal AMT"] === "" ? "#16adbd" : "#b55f6c"
            }}
          >
            {" "}
            {val["Withdrawal AMT"] === ""
              ? "+" + val["Deposit AMT"]
              : "-" + val["Withdrawal AMT"]}{" "}
          </td>
          <td> {val[headings[4]]} </td>
        </tr>
      );
    }
    return display;
  };

  handleChangePage = (event, newPage) => {
    this.setState({
      page: newPage
    });
  };

  handleChangeRowsPerPage = event => {
    this.setState({
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    });
  };

  render() {
    const { rowsPerPage, page } = this.state;
    const width = window.innerWidth;
    if (!this.state.data) {
      return (
        <div className="loader">
          <CircularProgress />
        </div>
      );
    }
    return (
      <div className="App">
        <div className="accDet">
          <p> Account No : {this.state.data[0]["Account No"]} </p>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={this.state.data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
          />
        </div>
        <Plot
          data={[
            {
              // x: this.state.data.slice(rowsPerPage * page, rowsPerPage * (page+1)).map( val => val["Date"] ),
              y: this.state.data
                .slice(rowsPerPage * page, rowsPerPage * (page + 1))
                .map(val => val["Balance AMT"]),
              type: "lines",
              mode: "lines+markers",
              marker: { color: "#16adbd" }
            }
          ]}
          layout={{
            width:
              width * 0.9 > 600
                ? width * 0.9 >= 1100
                  ? 1100
                  : width * 0.9
                : 600,
            height: 400,
            yaxis: {
              rangemode: "normal",
              autorange: "normal"
            },
            xaxis: {
              rangemode: "normal",
              autorange: "normal",
              showticklabels: false
            }
          }}
        />
        <table className="data">
          <thead>
            <tr>
              <td onClick={this.sortByDate("Date")}>
                {" "}
                Date <Sort />{" "}
              </td>
              <td> Transaction Details </td>
              <td onClick={this.sortByDate("Value Date")}>
                {" "}
                Value Date <Sort />{" "}
              </td>
              <td onClick={this.sortByAmt("Transaction")}>
                {" "}
                Transaction AMT <Sort />{" "}
              </td>
              <td onClick={this.sortByAmt("Balance")}>
                {" "}
                Balance AMT <Sort />{" "}
              </td>
            </tr>
          </thead>
          <tbody>{this.renderData()}</tbody>
        </table>
      </div>
    );
  }
}
