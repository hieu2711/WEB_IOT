import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

function ChartCircle({ data }) {
    const [series, setSeries] = useState([]);
    useEffect(() => {
        if (data !== undefined) {
            setSeries([data]);
        }
    }, [data]);

    const [options, setOptions] = useState({
        chart: {
            height: 350,
            type: 'radialBar',
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 225,
                hollow: {
                    margin: 0,
                    size: '70%',
                    background: 'transparent',
                    image: undefined,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    position: 'front',
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 0,
                        blur: 4,
                        opacity: 0.24,
                    },
                },
                track: {
                    background: '#fff',
                    strokeWidth: '67%',
                    margin: 0,
                    dropShadow: {
                        enabled: true,
                        top: -3,
                        left: 0,
                        blur: 4,
                        opacity: 0.35,
                    },
                },
                dataLabels: {
                    show: true,
                    name: {
                        offsetY: -10,
                        show: true,
                        color: '#888',
                        fontSize: '17px',
                    },
                    value: {
                        formatter: function (val) {
                            return parseInt(val);
                        },
                        color: '#00FF00',
                        fontSize: '40px',
                        show: true,
                    },
                },
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#ABE5A1'],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100],
            },
        },
        stroke: {
            lineCap: 'round',
        },
        labels: ['Percent'],
    });
    return (
        <div>
            <div id="card">
                <div id="chart">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="radialBar"
                        height={350}
                    />
                </div>
            </div>
            <div id="html-dist"></div>
        </div>
    );
}

export default ChartCircle;
