import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, CardHeader, CardTitle, Col } from 'reactstrap';

const ChartCommon = ({ data, additionalClass, value1, value2, name }) => {
    const [chartData, setChartData] = useState({
        series: [],
        options: {
            chart: {
                type: 'area',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
                background: {},
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
            },
            xaxis: {
                type: 'datetime',
                categories: [],
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                labels: {
                    style: {
                        colors: '#999999',
                    },
                },
            },
            yaxis: {
                tickAmount: 4,
                labels: {
                    style: {
                        colors: '#999999',
                    },
                },
            },
        },
    });

    useEffect(() => {
        if (data && data.length > 0 && chartData.series.length === 0) {
            const Data1 = data.map((item) => parseInt(item.humi));
            const Data2 = data.map((item) => parseInt(item.noise));
            const dates = data.map((item) => item.date);
            setChartData((prevState) => ({
                ...prevState,
                series: [
                    {
                        name: value1,
                        data: Data1,
                    },
                    {
                        name: value2,
                        data: Data2,
                    },
                ],
                options: {
                    ...prevState.options,
                    xaxis: {
                        type: 'datetime',
                        categories: dates,
                    },
                },
            }));
        }
    }, [data, chartData.series]);

    return (
        <Col>
            <Card
                style={{
                    borderRadius: '15px',
                    height: '100%',
                    background:
                        additionalClass === 'additional-white-class'
                            ? '#f6f9fc'
                            : 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%) border-box',
                }}
                className="card-chart"
            >
                <CardHeader>
                    <h5 style={{ color: 'rgb(160, 174, 192)' }}>{name}</h5>
                    <CardTitle tag="h3">
                        <i className="tim-icons icon-bell-55 text-info" />{' '}
                        763,215
                    </CardTitle>
                </CardHeader>
                <CardBody style={{ height: 'calc(100% - 70px)' }}>
                    {' '}
                    {/* Giảm chiều cao của card header */}
                    <div className="chart-area" style={{ height: '100%' }}>
                        {' '}
                        {/* Đặt chiều cao của chart area là 100% */}
                        <ReactApexChart
                            options={chartData.options}
                            series={chartData.series}
                            type="area"
                        />
                    </div>
                </CardBody>
            </Card>
        </Col>
    );
};

export default ChartCommon;
